const visibleObject = () => {
    for (asteriod in asteriodList) {
        if (-300 <= asteriodList[asteriod].dispX && asteriodList[asteriod].dispX <= 900 &&
            -300 <= asteriodList[asteriod].dispY && asteriodList[asteriod].dispY <= 900) {
            asteriodList[asteriod].display.style.display = "block";
        } else {
            asteriodList[asteriod].display.style.display = "none";
        }
    }
}
setInterval(visibleObject, 700);