import {useContext,createContext,useEffect} from 'react'
import supabase from './supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const AlertsContext = createContext([])
export const useRealtime = () => useContext(AlertsContext)

export const RealtimeProvider = ({children}) => {
    const queryClient = useQueryClient()
    //ANCHOR - ALERTS
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

    //ANCHOR - RESCUERS
    const fetchContact = async () => {
        const { data, error } = await supabase.from("emergencyPersons").select();

        if (error) {
        console.error("Fetch error in supabase emerP: ", error);
        }
        console.log("Successful fetch", data);
        return data;
    };
    // use data here to map the values and read
    const { data: emerPData, error: emerPError } = useQuery({
        queryKey: ["emergencyPersons"],
        queryFn: fetchContact,
    });
    if (emerPError) {
        console.error("Error in query of emergency persons table: ", emerPError);
    }

    //ANCHOR - EVAC CARD
    const fetchEvacData = async () => {
        const { data, error } = await supabase.from("evacuationCenter").select();

        if (error) {
        console.error("Fetch error in supabase evac: ", error);
        }
        console.log("Successful fetch", data);
        return data;
    };
    // use data here to map the values and read
    const { data: evacData, error: evacError } = useQuery({
        queryKey: ["evacuationCenter"],
        queryFn: fetchEvacData,
    });

    //ANCHOR - PICKUP CARD
    const fetchPickupData = async () => {
        const { data, error } = await supabase.from("pickupLocations").select();

        if (error) {
        console.error("Fetch error in supabase pickup: ", error);
        }
        console.log("Successful fetch", data);
        return data;
    };
    // use data here to map the values and read
    const { data: pickupData, error: pickupError } = useQuery({
        queryKey: ["pickupLocations"],
        queryFn: fetchPickupData,
    });

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
            queryClient.invalidateQueries(["alerts"]);

            }
        )
        .subscribe();

        const emerPChannnel = supabase
        .channel("emerP-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "emergencyPersons" },
            (payload) => {
            console.log("Realtime change received:", payload);

            // Ask react-query to refetch alerts when a row is inserted/updated/deleted
            queryClient.invalidateQueries(["emergencyPersons"]);
            }
        )
        .subscribe();

        const evacChannel = supabase
        .channel("evac-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "evacuationCenter" },
            (payload) => {
            console.log("Realtime change received:", payload);

            // Ask react-query to refetch alerts when a row is inserted/updated/deleted
            queryClient.invalidateQueries(["evacuationCenter"]);
            }
        )
        .subscribe();

        const pickupChannel = supabase
        .channel("pickup-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pickupLocations" },
            (payload) => {
            console.log("Realtime change received:", payload);

            // Ask react-query to refetch alerts when a row is inserted/updated/deleted
            queryClient.invalidateQueries(["pickupLocations"]);
            }
        )
        .subscribe();

        return () => {
        supabase.removeChannel(alertsChannel);
        supabase.removeChannel(emerPChannnel);
        supabase.removeChannel(evacChannel);
        supabase.removeChannel(pickupChannel);
        };
    }, []);

    return (
        <AlertsContext.Provider value={{alertsData,emerPData,evacData,pickupData}}>
            {children}
        </AlertsContext.Provider>
    );
}
