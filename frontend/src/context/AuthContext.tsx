import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<any>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    recaptchaToken?: string;
  }) => Promise<any>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('stepstunnerToken');
        const storedUser = localStorage.getItem('stepstunnerUser');
        
        console.log('Auth initialization - Token exists:', !!token);
        console.log('Auth initialization - Stored user exists:', !!storedUser);
        
        if (token && storedUser) {
          // Verify token with backend
          const res = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log('Profile response status:', res.status);
          
          if (res.ok) {
            const userData = await res.json();
            console.log('Profile response data:', userData);
            console.log('Role from profile:', userData.role);
            
            const user = {
              id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              profileImage: userData.profileImage,
              role: userData.role,
            };
            console.log('Setting user state with role:', user.role);
            setUser(user);
            // Update localStorage with fresh data
            localStorage.setItem("stepstunnerUser", JSON.stringify(user));
          } else {
            console.log('Token verification failed, clearing storage');
            // Token is invalid, clear storage
            localStorage.removeItem('stepstunnerToken');
            localStorage.removeItem('stepstunnerUser');
            setUser(null);
          }
        } else {
          console.log('No token or user data found, ensuring clean state');
          // No token or user data, ensure clean state
          localStorage.removeItem('stepstunnerToken');
          localStorage.removeItem('stepstunnerUser');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear storage on error
        localStorage.removeItem('stepstunnerToken');
        localStorage.removeItem('stepstunnerUser');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, recaptchaToken?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, recaptchaToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Login failed");
    
    const userData = { 
      id: data.user.id, 
      name: data.user.name, 
      email: data.user.email, 
      phone: data.user.phone, 
      profileImage: data.user.profileImage,
      role: data.user.role 
    };
    
    setUser(userData);
    localStorage.setItem("stepstunnerToken", data.token);
    localStorage.setItem("stepstunnerUser", JSON.stringify(userData));
    localStorage.removeItem("profileImage");
    
    return userData;
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    recaptchaToken?: string;
  }) => {
    const res = await fetch(
      '/api/auth/register',
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          recaptchaToken: userData.recaptchaToken,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    localStorage.removeItem("profileImage");
    // Remove automatic login - user should login manually after registration
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("stepstunnerToken");
    localStorage.removeItem("stepstunnerUser");
    localStorage.removeItem("profileImage");
  };

  const resetPassword = async (email: string) => {
    // Simulate API call - Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        resetPassword,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
