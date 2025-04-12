import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../../../lib/db';
import { verifyCredentials, verifyTOTP } from '../../../lib/auth';
import { getServerSession } from 'next-auth/next';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
        twoFactorCode: { label: "两步验证码", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials.username || !credentials.password) {
          throw new Error('InvalidCredentials');
        }
        
        try {
          // 验证用户名和密码
          const isValid = await verifyCredentials(
            credentials.username,
            credentials.password
          );
          
          if (!isValid) {
            throw new Error('InvalidCredentials');
          }
          
          // 获取用户数据
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });
          
          if (!user) {
            throw new Error('UserNotFound');
          }
          
          // 检查是否需要两步验证
          if (user.twoFactorEnabled) {
            // 如果未提供验证码
            if (!credentials.twoFactorCode) {
              throw new Error('TwoFactorRequired');
            }
            
            // 验证TOTP码
            const isValidTOTP = verifyTOTP(
              credentials.twoFactorCode,
              user.twoFactorSecret
            );
            
            if (!isValidTOTP) {
              throw new Error('InvalidTwoFactorCode');
            }
          }
          
          // 更新最后登录时间
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });
          
          return {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            username: user.username,
            isAnonymous: user.isAnonymous,
            privateKeyEncrypted: user.privateKeyEncrypted,
            publicKey: user.publicKey
          };
        } catch (error) {
          throw new Error(error.message || 'AuthError');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAnonymous = user.isAnonymous;
        token.privateKeyEncrypted = user.privateKeyEncrypted;
        token.publicKey = user.publicKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isAnonymous = token.isAnonymous;
        session.user.privateKeyEncrypted = token.privateKeyEncrypted;
        session.user.publicKey = token.publicKey;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions);

// 暴露一个服务器端获取会话的函数
export async function getServerAuthSession(req, res) {
  return await getServerSession(req, res, authOptions);
}
