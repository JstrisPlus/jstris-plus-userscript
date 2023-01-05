export const shouldRenderEffectsOnView = (view) => {
  return view.holdCanvas && view.holdCanvas.width >= 70;
}


export const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
}

// https://jsfiddle.net/12aueufy/1/
var shakingElements = [];

export const shake = function (element, magnitude = 16, numberOfShakes = 15, angular = false) {
  if (!element) return;

  //First set the initial tilt angle to the right (+1)
  var tiltAngle = 1;

  //A counter to count the number of shakes
  var counter = 1;

  //The total number of shakes (there will be 1 shake per frame)

  //Capture the element's position and angle so you can
  //restore them after the shaking has finished
  var startX = 0,
    startY = 0,
    startAngle = 0;

  // Divide the magnitude into 10 units so that you can
  // reduce the amount of shake by 10 percent each frame
  var magnitudeUnit = magnitude / numberOfShakes;

  //The `randomInt` helper function
  var randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  //Add the element to the `shakingElements` array if it
  //isn't already there


  if (shakingElements.indexOf(element) === -1) {
    //console.log("added")
    shakingElements.push(element);

    //Add an `updateShake` method to the element.
    //The `updateShake` method will be called each frame
    //in the game loop. The shake effect type can be either
    //up and down (x/y shaking) or angular (rotational shaking).
    if (angular) {
      angularShake();
    } else {
      upAndDownShake();
    }
  }

  //The `upAndDownShake` function
  function upAndDownShake() {

    //Shake the element while the `counter` is less than
    //the `numberOfShakes`
    if (counter < numberOfShakes) {

      //Reset the element's position at the start of each shake
      element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';

      //Reduce the magnitude
      magnitude -= magnitudeUnit;

      //Randomly change the element's position
      var randomX = randomInt(-magnitude, magnitude);
      var randomY = randomInt(-magnitude, magnitude);

      element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';

      //Add 1 to the counter
      counter += 1;

      requestAnimationFrame(upAndDownShake);
    }

    //When the shaking is finished, restore the element to its original
    //position and remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'translate(' + startX + ', ' + startY + ')';
      shakingElements.splice(shakingElements.indexOf(element), 1);
    }
  }

  //The `angularShake` function
  function angularShake() {
    if (counter < numberOfShakes) {

      //Reset the element's rotation
      element.style.transform = 'rotate(' + startAngle + 'deg)';

      //Reduce the magnitude
      magnitude -= magnitudeUnit;

      //Rotate the element left or right, depending on the direction,
      //by an amount in radians that matches the magnitude
      var angle = Number(magnitude * tiltAngle).toFixed(2);

      element.style.transform = 'rotate(' + angle + 'deg)';
      counter += 1;

      //Reverse the tilt angle so that the element is tilted
      //in the opposite direction for the next shake
      tiltAngle *= -1;

      requestAnimationFrame(angularShake);
    }

    //When the shaking is finished, reset the element's angle and
    //remove it from the `shakingElements` array
    if (counter >= numberOfShakes) {
      element.style.transform = 'rotate(' + startAngle + 'deg)';
      shakingElements.splice(shakingElements.indexOf(element), 1);
    }
  }

};


// @params callback: (name: string , loggedIn: boolean) => {}
export const getPlayerName = (callback) => {
  fetch("https://jstris.jezevec10.com/profile").then(res => {
    if (res.url.includes("/u/")) {
      let username = res.url.substring(res.url.indexOf("/u/") + 3);
      callback(username, true);
    } else {
      callback("", false)
    }
  }).catch(e => {
    console.log(e);
    callback("", false)
  })
}

let notificationsSupported = false

export const authNotification = () => {
  if (!window.Notification) {
    notificationsSupported = false
  } else if (Notification.permission != 'granted') {
    Notification.requestPermission().then((p) => {
      if (p === 'granted') {
        notificationsSupported = true
      } else {
        console.log('User has blocked notifications.')
      }
    }).catch((err) => {
      console.error(err)
    })
  } else {
    notificationsSupported = true
  }
}

export const notify = (title, body) => {
  if (notificationsSupported) {
    new Notification(title, {
      body: body,
      icon: 'https://freyhoe.github.io/Jstris-/logo.png'
    })
  }
}

let plusSfx = { //fallback
  READY: "https://freyhoe.github.io/Jstris-/sfx/ready.wav",
  PB: "https://freyhoe.github.io/Jstris-/sfx/personalBest.wav"
}
export const setPlusSfx = (sfx) => {
  let d = document.getElementById('custom_plus_sfx_json_err')
  try {
    sfx = JSON.parse(sfx)
  } catch (e) {

    if (d) {
      d.textContent = "SFX json is invalid"
    }
    return
  }
  d.textContent = `Loaded ${sfx.name} Jstris+ SFX`
  plusSfx = sfx
}
export const playSound = (id) => {
  if (!plusSfx[id]) {
    return console.error(`unknown sfx ${id}`)
  }
  const audio = new Audio(plusSfx[id]);
  audio.play();
}
