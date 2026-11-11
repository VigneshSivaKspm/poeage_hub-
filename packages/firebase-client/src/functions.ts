import { httpsCallable } from 'firebase/functions';
import { firebase } from './config.ts';

export async function callFunction<TResponse = unknown, TRequest = unknown>(
  name: string,
  data?: TRequest,
): Promise<TResponse> {
  const callable = httpsCallable<TRequest, TResponse>(firebase.functions, name);
  const result = await callable(data);
  return result.data;
}

export { httpsCallable };
