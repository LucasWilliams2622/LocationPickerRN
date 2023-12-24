import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import AppButton from './AppButton';
import {useNavigation} from '@react-navigation/native';

const LocationPicker = props => {
  const navigation = useNavigation();
  const [mapRef, setMapRef] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Agree to allow location access',
          message: 'Please grant permission for AppRN',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Agree',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setMarkerPosition({latitude, longitude});
        convertCoordinatesToAddress(latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const convertCoordinatesToAddress = (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const address = data.display_name;
        console.log(address);
        setAddress(address);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const handleMarkerPress = event => {
    const {coordinate} = event.nativeEvent;
    setMarkerPosition(coordinate);
    convertCoordinatesToAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleGetAddress = () => {
    Alert.alert(
      'Location',
      `${markerPosition.latitude}, ${markerPosition.longitude}`,
    );
  };
  const handleAddressPress = () => {
    if (markerPosition && mapRef) {
      const {latitude, longitude} = markerPosition;
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.animateToRegion(region, 1000); // Adjust the duration as needed
    }
  };

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={ref => {
          setMapRef(ref);
          // console.log('Map reference set:', ref);
        }}
        style={{flex: 1}}
        initialRegion={{
          latitude: markerPosition?.latitude || 10.7769,
          longitude: markerPosition?.longitude || 106.7009,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={event => handleMarkerPress(event)}>
        {markerPosition && <Marker coordinate={markerPosition} />}
      </MapView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10,
          width: '74%',
          alignSelf: 'center',
          backgroundColor: 'white',
          opacity: 0.7,
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
        }}
        onPress={() => {
          navigation.goBack();
        }}>
        <View style={styles.boxBack}>
          <Icon
            name="arrow-back-circle-outline"
            type={IconType.Ionicons}
            size={32}
            color={'#41cff2'}
            style={{position: 'absolute'}}
          />
        </View>
        <Text style={[{fontWeight: '600', color: '#41cff2'}]}>Back</Text>
        <View style={{width: '10%'}} />
      </TouchableOpacity>

      {address !== '' && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 60,
            alignSelf: 'center',
            padding: 12,
            backgroundColor: 'white',
            borderRadius: 8,
            width: '94%',
          }}
          onPress={handleAddressPress}>
          <Text style={{fontWeight: '500', fontSize: 12}}>{address}</Text>
        </TouchableOpacity>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 10,
            position: 'absolute',
            alignSelf: 'center',
            width: '94%',
          },
        ]}>
        <AppButton
          width={'48%'}
          onPress={handleGetLocation}
          containerStyle={{}}
          title="Get current location"
        />
        <AppButton
          width={'48%'}
          backgroundColor="white"
          textColor={'#41cff2'}
          onPress={handleGetAddress}
          containerStyle={{}}
          title="Get location"
        />
      </View>
    </View>
  );
};

export default LocationPicker;
const styles = StyleSheet.create({
  boxBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
