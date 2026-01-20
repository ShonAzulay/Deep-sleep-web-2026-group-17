import { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '../../server/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'student', 'teacher', 'researcher'
    const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial manual restoration from sessionStorage (preserves "static site" feel)
        try {
            const stored = sessionStorage.getItem("currentUser");
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                if (parsed.role) setRole(parsed.role);
            }
        } catch (e) {
            console.error("Failed to restore session from storage", e);
        }

        // 2. Firebase Auth Listener
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Note: This mainly handles the "auth" state. 
            // The "user" state in our app is a richer object (DB profile).
            // If firebase detects a user but we don't have our rich object, 
            // we rely on the manual set from Login or sessionStorage.
            // If firebase detects LOGOUT, we must clear everything.
            if (!currentUser) {
                // Only force clear if we really want to auto-logout on firebase event
                // But since we manage session manually too, let's just ensure sync.
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Apply theme to HTML tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Logout error", e);
        }
        sessionStorage.removeItem("currentUser");
        setUser(null);
        setRole(null);
    };

    return (
        <AppContext.Provider value={{ user, setUser, role, setRole, theme, toggleTheme, logout, loading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
