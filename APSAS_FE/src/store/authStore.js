import { create } from "zustand";
const KEY = "apsas_auth";
export const useAuth = create((set) => ({
  token: null, user: null,
  load: () => { const raw = localStorage.getItem(KEY); if(raw){ try{ set(JSON.parse(raw)); }catch{} } },
  setAuth: (v) => { localStorage.setItem(KEY, JSON.stringify(v)); set(v); },
  clear: () => { localStorage.removeItem(KEY); set({ token:null, user:null }); },
}));
