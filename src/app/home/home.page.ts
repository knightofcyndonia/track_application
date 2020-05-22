<<<<<<< HEAD
import { Component, ViewChild, ElementRef, OnInit  } from '@angular/core';
=======
import { Component, ViewChild, ElementRef } from '@angular/core';
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0

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

<<<<<<< HEAD
  lastLocation :any = [];

  @ViewChild('map') mapElement: ElementRef;
  maps: any;
=======
  @ViewChild('map') mapElement: ElementRef;
  map: any;
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
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
<<<<<<< HEAD
    console.log("masuk anon login");
    this.afAuth.signInAnonymously().then(res =>{
      this.user = res.user;
      this.locationsCollection = this.afs.collection(
        // `locations/${this.user.uid}/track`,
        // // ref => ref.orderBy('timestamp')
        `locations`,
        ref => ref.orderBy('timestamp')
      )


=======
    this.afAuth.signInAnonymously().then(res =>{
      console.log(res);
      this.user = res.user;

      this.locationsCollection = this.afs.collection(
        `locations/${this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      )

>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
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
 
<<<<<<< HEAD
    this.maps = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
=======
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
  }

  // Use Capacitor to track our geolocation
startTracking() {
<<<<<<< HEAD
  console.log("Start Tracking");

  let busName = "BUS 1";
  
  this.locations.subscribe(locations =>{

    let listLocation = [];
    for( let i = 0 ; i < locations.length; i++)
    {
      let strLocUid = locations[i].userId.toString()
      let strThisUid = this.user.uid.toString()
      console.log(strLocUid + " = " + strThisUid)

      if(strLocUid === strThisUid)
      {
        listLocation.push(locations[i])
        busName = locations[i].bus_name
      }
      else
      {
        let lastLocations = locations[locations.length - 1];
        let splitBusNameChar = lastLocations.bus_name.split(" ");
        let busNumber = parseInt(splitBusNameChar[1]) + 1;
        busName = "BUS " + busNumber;
      }
    }

    console.log("new list location")
    console.log(listLocation)

    if(locations.length > 0)
    {
      let indexNotToDelete = listLocation.length - 1;
      for (let i = 0; i < listLocation.length; i++)
      {
          if(i !== indexNotToDelete)
          {
            this.deleteLocation(listLocation[i]);
          }
      }
    }
  })

  let timeRemaining = "";
=======
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
  this.isTracking = true;
  this.watch = Geolocation.watchPosition({}, (position, err) => {
    if (position) {
      this.addNewLocation(
        position.coords.latitude,
        position.coords.longitude,
<<<<<<< HEAD
        position.timestamp,
        this.user.uid,
        busName,
        timeRemaining
=======
        position.timestamp
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
      );
    }
  });
}
 
// Unsubscribe from the geolocation watch using the initial ID
stopTracking() {
  Geolocation.clearWatch({ id: this.watch }).then(() => {
    this.isTracking = false;
  });
<<<<<<< HEAD
  
}
 
// Save a new location to Firebase and center the map
addNewLocation(lat, lng, timestamp, userId, bus_name, time_remaining) {
  
  console.log("Add new location");
  console.log(lat);
  console.log(lng);
  console.log(timestamp);
  console.log(bus_name);

  this.locationsCollection.add({
    lat,
    lng,
    timestamp,
    userId,
    bus_name,
    time_remaining
  });
 
  let position = new google.maps.LatLng(lat, lng);
  this.maps.setCenter(position);
  this.maps.setZoom(15);
=======
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
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
}
 
 
// Redraw all markers on the map
updateMap(locations) {
<<<<<<< HEAD
  
  console.log("masuk update map");
=======
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
  // Remove all current marker
  this.markers.map(marker => marker.setMap(null));
  this.markers = [];
 
  for (let loc of locations) {
    let latLng = new google.maps.LatLng(loc.lat, loc.lng);
 
    let marker = new google.maps.Marker({
<<<<<<< HEAD
      map: this.maps,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    this.markers.push(marker);
    this.lastLocation = loc;
=======
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    // this.markers.push(marker);
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
  }
}

// Delete a location from Firebase
deleteLocation(pos) {
  // console.log('delete : ', pos);
<<<<<<< HEAD
  
  console.log("masuk delete location");
  console.log(pos)
=======
>>>>>>> e615d571d4f64a3f18490296d80e83375d4edfb0
  this.locationsCollection.doc(pos.id).delete();
}


}
