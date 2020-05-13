import { Component, ViewChild, ElementRef } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

import { map } from 'rxjs/operators';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  locations: Observable <any>;
  locationsCollection: AngularFirestoreCollection<any>;
  user = null;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = []; 

  isTracking = false;
  watch = null;

  constructor(
    private afAuth : AngularFireAuth,
    private  afs: AngularFirestore
  ) {
    this.anonLogin();
  }

  ionViewWillEnter(){
    this.loadMap();
  }

  anonLogin(){
    this.afAuth.signInAnonymously().then(res =>{
      console.log(res);
      this.user = res.user;

      this.locationsCollection = this.afs.collection(
        `locations/${this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      )

      //load firebase data
      // this.locations = this.locationsCollection.valueChanges();

      //make sure we also get the Firebase item ID!
      this.locations = this.locationsCollection.snapshotChanges().pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );

      //update map
      this.locations.subscribe(locations => {
        console.log('new locations :', locations);
        this.updateMap(locations);
      });
    })
  }

  loadMap() {
    let latLng = new google.maps.LatLng(1.0649600000000001, 103.9826944);
 
    let mapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  // Use Capacitor to track our geolocation
startTracking() {
  this.isTracking = true;
  this.watch = Geolocation.watchPosition({}, (position, err) => {
    if (position) {
      this.addNewLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.timestamp
      );
    }
  });
}
 
// Unsubscribe from the geolocation watch using the initial ID
stopTracking() {
  Geolocation.clearWatch({ id: this.watch }).then(() => {
    this.isTracking = false;
  });
}
 
// Save a new location to Firebase and center the map
addNewLocation(lat, lng, timestamp) {
  
  console.log("husein postition");
  console.log(lat);
  console.log(lng);
  console.log(timestamp);
  this.locationsCollection.add({
    lat,
    lng,
    timestamp
  });
 
  let position = new google.maps.LatLng(lat, lng);
  this.map.setCenter(position);
  this.map.setZoom(5);
}
 
 
// Redraw all markers on the map
updateMap(locations) {
  // Remove all current marker
  this.markers.map(marker => marker.setMap(null));
  this.markers = [];
 
  for (let loc of locations) {
    let latLng = new google.maps.LatLng(loc.lat, loc.lng);
 
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    // this.markers.push(marker);
  }
}

// Delete a location from Firebase
deleteLocation(pos) {
  // console.log('delete : ', pos);
  this.locationsCollection.doc(pos.id).delete();
}


}
