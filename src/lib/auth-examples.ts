import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Exemplo de login com Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Usuário logado:", result.user);
    return result.user;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

// Exemplo de logout
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado");
  } catch (error) {
    console.error("Erro no logout:", error);
    throw error;
  }
};

// Exemplo de listener de mudança de estado de autenticação
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Exemplo de uso em um componente React
export const useAuthExample = () => {
  // Este seria usado em um hook personalizado
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, loginWithGoogle, logout };
};

// Importar React para o exemplo
import React from 'react';
