import { createContext } from "react";
import type { AppContextType } from "./useApp";

export const AppContext = createContext<AppContextType | null>(null);
