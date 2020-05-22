import { Component, ViewChild, ElementRef, OnInit  } from '@angular/core';

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

  lastLocation :any = [];

  @ViewChild('map') mapElement: ElementRef;
  maps: any;
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
    console.log("masuk anon login");
    this.afAuth.signInAnonymously().then(res =>{
      this.user = res.user;
      this.locationsCollection = this.afs.collection(
        // `locations/${this.user.uid}/track`,
        // // ref => ref.orderBy('timestamp')
        `locations`,
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
 
    this.maps = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  // Use Capacitor to track our geolocation
startTracking() {
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
  this.isTracking = true;
  this.watch = Geolocation.watchPosition({}, (position, err) => {
    if (position) {
      this.addNewLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.timestamp,
        this.user.uid,
        busName,
        timeRemaining
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
}
 
 
// Redraw all markers on the map
updateMap(locations) {
  
  console.log("masuk update map");
  // Remove all current marker
  this.markers.map(marker => marker.setMap(null));
  this.markers = [];
 
  for (let loc of locations) {
    let latLng = new google.maps.LatLng(loc.lat, loc.lng);
 
    let marker = new google.maps.Marker({
      map: this.maps,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    this.markers.push(marker);
    this.lastLocation = loc;
  }
}

// Delete a location from Firebase
deleteLocation(pos) {
  // console.log('delete : ', pos);
  
  console.log("masuk delete location");
  console.log(pos)
  this.locationsCollection.doc(pos.id).delete();
}


}
