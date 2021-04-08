//alert("This is just a test");
var first = document.getElementById('first');
var second = document.getElementById('second');
var third = document.getElementById('third');
var fourth = document.getElementById('fourth');
var fifth = document.getElementById('fifth');
var result = document.getElementById('result');

first.addEventListener("input", sum);
second.addEventListener("input", sum);
third.addEventListener("input", sum);
fourth.addEventListener("input", sum);
fifth.addEventListener("input", sum);

function sum() {
  
var one = parseFloat(first.value) || 0;
var two = parseFloat(second.value) || 0;
var three = parseFloat(third.value) || 0;
var four = parseFloat(fourth.value) || 0;
var five = parseFloat(fifth.value) || 0;
  
var calculate = one+two+three+four+five;

result.innerHTML = "Total Caloric Intake Is : " + calculate;
}
//inspired by https://www.facebook.com/iamsrithanreddy

function calorieInformation() {
    function find(id) { return document.getElementById(id) }

    var age = find("age").value
    var height = find("height").value
    var weight = find("weight").value
    var result = 0
    if (find("male").checked) 
      result = 66 + (6.2 * weight) + (12.7 * height - (6.76 * age))
    else if (find("female").checked)
      result = 665.1 + (4.35 * weight) + (4.7 * height - (4.7 * age))
    find("totalCals").innerHTML = Math.round(result)

    // allow button to appear
    document.getElementById("BMRsubmit").style.visibility = "inherit";
    document.getElementById("BMRsubmit").style.height = "auto";
}

  // using jquery/ajax post call
  function postBMR() {
    var BMR = parseFloat(document.getElementById("totalCals").innerHTML);
    $.post("/BMRcalc", { BMR: BMR });
  }

  //Men: BMR = 66 + (6.2 × weight in pounds) + (12.7 × height in inches) – (6.76 × age in years)
  //Women: BMR = 655.1 + (4.35 × weight in pounds) + (4.7 × height in inches) – (4.7 × age in years)

  function TDEE(){
    function find(id) { return document.getElementById(id) }

    var BMR = find("BMR").value
    var result = 0
    if (find("sedentary").checked) 
    result = BMR*1.2;
    else if (find("light_activity").checked)
    result = BMR*1.375;
    else if (find("mod_activity").checked)
    result = BMR*1.55;
    else if (find("much_activity").checked)
    result = BMR*1.725;
    else if (find("extra_activity").checked)
    result = BMR*1.9;
    find("totalTDEE").innerHTML = Math.round(result)
  }
  TDEE()