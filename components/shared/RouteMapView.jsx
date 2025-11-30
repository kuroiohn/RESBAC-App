import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";

export default function RouteMapView({ src, dest, popupTitle }) {
  const mapRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

  if (!src || !dest) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size='large' color='#0060FF' />
      </View>
    );
  }

  const srcObj = { latitude: src[0], longitude: src[1] };
  const destObj = { latitude: dest[0], longitude: dest[1] };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: srcObj.latitude,
          longitude: srcObj.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User */}
        <Marker coordinate={srcObj} title='You' pinColor='#0060FF' />

        {/* Destination */}
        <Marker coordinate={destObj} title={popupTitle} />

        {/* Route */}
        <MapViewDirections
          origin={srcObj}
          destination={destObj}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={5}
          strokeColor='#0060FF'
          onReady={(result) => {
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 90, right: 90, bottom: 90, left: 90 },
              animated: true,
            });
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
