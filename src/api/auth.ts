// /api/auth.ts
import { get } from '../utils/request';

interface LoginParams {
  code: string;
}

interface LoginResponse extends Response {
  data: {
    token: string;
  };
}

// export const alogin = async ({ code }: LoginParams): Promise<LoginResponse> => {
//   console.log('授权登录：'+ code)
//   try {
//     const response = await get('/auth/mini-app/login', { code });
//     console.log('授权登录：'+ response)
//     return response as LoginResponse;
//   } catch (error) {
//     throw new Error(error.message || '登录失败');
//   }
// };
export async function alogin(params) {
  return await get(`/auth/mini-app/login`,params);
} 