// ============================================
// 認証フック
// ============================================

import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 認証状態の監視
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // ログイン済み
          setAuthState({ user, loading: false, error: null });
        } else {
          // 未ログイン → 匿名ログイン実行
          try {
            await signInAnonymously(auth);
            // onAuthStateChangedが再度呼ばれるので、ここでは何もしない
          } catch (error) {
            setAuthState({ 
              user: null, 
              loading: false, 
              error: error as Error 
            });
          }
        }
      },
      (error) => {
        setAuthState({ user: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, []);

  return authState;
};
