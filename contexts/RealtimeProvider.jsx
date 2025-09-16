import {useContext,createContext,useEffect} from 'react'
import supabase from './supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const AlertsContext = createContext([])
export const useAlerts = () => useContext(AlertsContext)

const ProfileContext = createContext([])
export const useProfile = () => useContext(ProfileContext)

export const RealtimeProvider = ({children}) => {
    const queryClient = useQueryClient()
    // reads from supabase
    const fetchAlertsData = async () => {
        const { data, error } = await supabase.from("alerts").select();

        if (error) {
        console.error("Fetch error in supabase alert card: ", error);
        }
        console.log("Successful fetch", data);
        return data;
    };
    const { data: alertsData, error: alertsError } = useQuery({
        queryKey: ["alerts"],
        queryFn: fetchAlertsData,
    });
    if(alertsError){
        console.error("Error in fetching realtime alerts: ", alertsError);
    }

    // Subscribe to realtime changes
    useEffect(() => {
        const alertsChannel = supabase
        .channel("alerts-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "alerts" },
            (payload) => {
            console.log("Realtime change received:", payload);

            queryClient.setQueryData(["alerts"], (oldData) => {
                if (!oldData) return [payload.new]; // initial
                const index = oldData.findIndex((a) => a.id === payload.new.id);
                if (index > -1) oldData[index] = payload.new;
                else oldData.push(payload.new);
                return [...oldData];
            });
            }
        )
        .subscribe();

        return () => {
        supabase.removeChannel(alertsChannel);
        };
    }, []);

    return (
        <AlertsContext.Provider value={alertsData}>
            {children}
        </AlertsContext.Provider>
    );
}
