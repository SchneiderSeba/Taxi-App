import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientSupaBase } from '../supabase/client';

const UserContext = createContext<{ isAuthenticated: boolean; setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>> } | undefined>(undefined);

export const useUserContext = () => {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return userContext;
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    // Crear registro en UserProfile si no existe
const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function ensureUserProfile() {
      const { data: userData } = await clientSupaBase.auth.getUser();
      const user = userData?.user;
      const userDisplayName = user.user_metadata.full_name || user.user_metadata.name || user.email.split("@")[0];
      if (!user) return;

      const { data: profile, error } = await clientSupaBase
        .from('UsersProfile')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user profile', error);
        return;
      }

      console.log('userData:', userData);
      console.log('userDisplayName:', userDisplayName);

      if (!profile) {
        const payload = {
          owner_id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'Usuario',
          displayName: userDisplayName || user.email?.split('@')[0] || 'Usuario',
          created_at: new Date().toISOString(),
          carModel: '',
          carPlate: '',
          pictureUrl: user.user_metadata?.avatar_url || null
        };
        const { error: insertError } = await clientSupaBase
          .from('UsersProfile')
          .insert([payload])
          .select();
        if (insertError) {
          console.error('Error inserting user profile', insertError, payload);
        }
      } else if (!profile.displayName && userDisplayName) {
        // Si el perfil existe pero no tiene displayName, actualizarlo
        const { error: updateError } = await clientSupaBase
          .from('UsersProfile')
          .update({ 
            displayName: userDisplayName,
            pictureUrl: user.user_metadata?.avatar_url || profile.pictureUrl
          })
          .eq('owner_id', user.id);
        
        if (updateError) {
          console.error('Error updating user profile with displayName', updateError);
        }
      }
    }
    if (isAuthenticated) {
      ensureUserProfile();
      
    }
    
  }, [isAuthenticated]);
  
  // Sincroniza el estado de autenticación con Supabase
  useEffect(() => {
    // Chequea usuario actual al montar
    clientSupaBase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsAuthenticated(true);
      }
    });
    // Suscribe a cambios de sesión
    const { data: listener } = clientSupaBase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
         </UserContext.Provider>;
}