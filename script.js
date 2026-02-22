async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  alert("Registered Successfully");
  window.location.href = "/";
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if(data.token){
    window.location.href = "dashboard.html";
  } else {
    alert("Login Failed");
  }
}

async function getFare() {
  const data = {
    pickup_lat: pickup_lat.value,
    pickup_lng: pickup_lng.value,
    drop_lat: drop_lat.value,
    drop_lng: drop_lng.value,
    vehicle: vehicle.value,
    sharing: sharing.checked,
    hour: hour.value,
    day: day.value
  };

  const res = await fetch("/fare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById("result").innerHTML =
    `Distance: ${result.distance} km <br> Fare: ₹ ${result.fare}`;
}
