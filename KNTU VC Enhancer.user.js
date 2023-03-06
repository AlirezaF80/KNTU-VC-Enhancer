// ==UserScript==
// @name         KNTU VC Enhancer
// @namespace    http://vc.kntu.ac.ir/
// @version      0.5.1
// @description  Adds new features and fixes bugs of KNTU VC
// @author       AlirezaF
// @match        *://vc4012.kntu.ac.ir/*
// @match        *://vc4011.kntu.ac.ir/*
// @match        *://vc4002.kntu.ac.ir/*
// @match        *://vc4001.kntu.ac.ir/*
// @match        *://vc3992.kntu.ac.ir/*
// @match        *://vc3991.kntu.ac.ir/*
// @match        *://vc*.kntu.ac.ir/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kntu.ac.ir
// @grant        none
// ==/UserScript==
JalaliDate = {
    g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
    MONTHS: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
};
JalaliDate.toGregorian = function(j_y, j_m, j_d) {
    j_y = parseInt(j_y);
    j_m = parseInt(j_m);
    j_d = parseInt(j_d);
    var jy = j_y - 979;
    var jm = j_m - 1;
    var jd = j_d - 1;

    var j_day_no = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4);
    for (var i = 0; i < jm; ++i) j_day_no += JalaliDate.j_days_in_month[i];

    j_day_no += jd;

    var g_day_no = j_day_no + 79;

    var gy = 1600 + 400 * parseInt(g_day_no / 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    g_day_no = g_day_no % 146097;

    var leap = true;
    if (g_day_no >= 36525) /* 36525 = 365*100 + 100/4 */
    {
        g_day_no--;
        gy += 100 * parseInt(g_day_no / 36524); /* 36524 = 365*100 + 100/4 - 100/100 */
        g_day_no = g_day_no % 36524;

        if (g_day_no >= 365) g_day_no++;
        else leap = false;
    }

    gy += 4 * parseInt(g_day_no / 1461); /* 1461 = 365*4 + 4/4 */
    g_day_no %= 1461;

    if (g_day_no >= 366) {
        leap = false;

        g_day_no--;
        gy += parseInt(g_day_no / 365);
        g_day_no = g_day_no % 365;
    }

    for (var i = 0; g_day_no >= JalaliDate.g_days_in_month[i] + (i == 1 && leap); i++)
    g_day_no -= JalaliDate.g_days_in_month[i] + (i == 1 && leap);
    var gm = i + 1;
    var gd = g_day_no + 1;

    gm = gm < 10 ? "0" + gm : gm;
    gd = gd < 10 ? "0" + gd : gd;

    return [gy, gm, gd];
};
(function() {
    'use strict';
    function getHTMLDoc(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var response = xhr.responseText;
                var parser = new DOMParser();
                var doc = parser.parseFromString(response, "text/html");
                callback(doc);
            }
        };
        xhr.send();
    }
    function fixDropdownMenuWidth() {
        // find all divs with class="dropdown-menu ..."
        var divs = document.getElementsByClassName("dropdown-menu")
        // for(var i = 0; i < 1; i++) {
        divs[0].setAttribute("style", "left: -100%;");
        // }
    }
    function addNoticeBoard(){
        // add notice board's page details inside the course's page
        // first find the url of the notice board's page
        let noticeBoardUrl = null;
        // find li with class="activity forum modtype_forum" and get the first a tag
        const forums = document.querySelectorAll(".activity.forum.modtype_forum");
        noticeBoardUrl = forums[0]?.querySelector("a")?.href ?? null;
        if (noticeBoardUrl == null) return;
    
        getHTMLDoc(noticeBoardUrl, (doc) => {
            // get the div with role="main" inside noticeBoardUrl
            const mainDiv = doc.querySelector("div[role='main']");
            // add the mainDiv to the current page
            const mainDivs = document.querySelectorAll("div[class='course-content']");
            // add the mainDiv as the last child of the first mainDiv
            mainDivs[0].prepend(mainDiv);
        });
    }
    function addCourseDescription(){
        // get course description
        // find div with class="coursesummary"
        var divs = document.getElementsByClassName("coursesummary");
        if(divs.length == 0) return;
        // find div with class="text_to_html"
        var divs2 = divs[0].getElementsByClassName("text_to_html");
        if(divs2.length == 0) return;
        var courseDescription = divs2[0].innerHTML;
        // add course description to the page
        // add a ul with class="breadcrumb" to div with id="page-navbar"
        var ul = document.createElement("ul");
        ul.setAttribute("class", "breadcrumb");
        // add course description to the ul
        var li = document.createElement("li");
        li.innerHTML = courseDescription;
        ul.appendChild(li);
        var divs3 = document.getElementById("page-navbar");
        divs3.appendChild(ul);
    }
    function addTeacherName(){
        // get teacher name
        // find div with class="staffmember"
        // find first div with class="staffinfo"
        // get the text
        var divs = document.getElementsByClassName("staffmember");
        if(divs.length == 0) return;
        var divs2 = divs[0].getElementsByClassName("staffinfo");
        if(divs2.length == 0) return;
        // find h4 tag inside the div
        var h4s = divs2[0].getElementsByTagName("h4");
        if(h4s.length == 0) return;
        var teacherName = h4s[0].innerHTML;
        // add teacher name to the page
        // find div with class="page-header-headings"
        // append teacher name to the h1 tag inside the div
        var divs3 = document.getElementsByClassName("page-header-headings");
        if(divs3.length == 0) return;
        var h1s = divs3[0].getElementsByTagName("h1");
        if(h1s.length == 0) return;
        h1s[0].innerHTML += " - " + teacherName;
    }
    function addAssignmentsDetails() {
        const activities = document.querySelectorAll(".activityinstance");
        if (activities.length == 0) return;
        activities.forEach((activity) => {
            const links = activity.querySelectorAll("a");
            if (links.length == 0) return;
            const url = links[0].href;
            if (!url.includes("mod/assign")) return;
            getHTMLDoc(url, (doc) => {
                const submissionStatusTable = doc.querySelector(".submissionstatustable");
                if (!submissionStatusTable) return;
                const rows = submissionStatusTable.querySelectorAll("tr");
                if (rows.length < 4) return;
                let cells = rows[0].querySelectorAll("td");
                const status = cells[0].classList.contains("submissionstatussubmitted") ? "تحویل داده شده" : "تحویل داده نشده";
                links[0].innerHTML += ` - ${status}`;
                cells = rows[3].querySelectorAll("td");
                const classList = cells[0].classList;
                let backCol, fontCol;
                switch (true) {
                    case classList.contains("earlysubmission"):
                        backCol = "#cfefcf";
                        fontCol = "#0f4d0f";
                        break;
                    case classList.contains("latesubmission"):
                        links[0].innerHTML += " (با تاخیر)";
                        backCol = "#ffff99";
                        fontCol = "#666600";
                        break;
                    case classList.contains("overdue"):
                        backCol = "#efcfcf";
                        fontCol = "#660000";
                        break;
                }
                if (backCol && fontCol) {
                    activity.style.backgroundColor = backCol;
                    links[0].style.color = fontCol;
                }
                cells = rows[2].querySelectorAll("td");
                const submissionDate = cells[0].innerText;
                links[0].innerHTML += ` - ${submissionDate}`;
            });
        });
    }

    function getCalendarButton(name, date){
        var button = document.createElement("button");
        button.innerHTML = "اضافه کردن به تقویم";
        button.onclick = function(){
            var url = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + name + "&dates=" + date;
            window.open(url, '_blank');
        }
        // add "btn btn-primary" to button's class
        button.setAttribute("class", "btn btn-primary");
        // set it to the left side
        button.style.float = "left";
        return button;
    }
    function parseDateText(dateText){
        var dueDateParts = dateText.split('، ');
        var date = dueDateParts[0].trim();
        var time = dueDateParts[1].trim();
        // get persian date
        var dateParts = date.split(' ');
        var j_day = parseInt(dateParts[0]);
        var j_monthText = dateParts[1];
        var j_year = parseInt(dateParts[2]);
        var j_month = 0;
        for (var i = 0; i < JalaliDate.MONTHS.length; i++) {
            if (JalaliDate.MONTHS[i] == j_monthText) {
                j_month = i + 1;
                break;
            }
        }
        // get time
        var timeParts = time.split(' ');
        var hour = parseInt(timeParts[0].split(':')[0]);
        var minute = parseInt(timeParts[0].split(':')[1]);
        var amPM = timeParts[1];
        if (amPM == "عصر") {
            hour += 12;
        }
        return [j_year, j_month, j_day, hour, minute];
    }
    function convertToGregorian(j_year, j_month, j_day, hour, minute){
        // convert jalali date to gregorian date
        var gregorianDate = JalaliDate.toGregorian(j_year, j_month, j_day);
        var greg_year = gregorianDate[0];
        var greg_month = gregorianDate[1];
        var greg_day = gregorianDate[2];
        
        // convert time to UTC
        // get current time zone
        var timeZone = new Date().getTimezoneOffset();
        hour += (timeZone - timeZone % 60) / 60;
        minute += timeZone % 60;
        if (minute < 0) {
            minute += 60;
            hour -= 1;
        }
        if (hour < 0) {
            hour += 24;
            greg_day -= 1;
        }
        if (greg_day < 1) {
            greg_month -= 1;
            if (greg_month < 1) {
                greg_month += 12;
                greg_year -= 1;
            }
            greg_day = JalaliDate.g_days_in_month[greg_month - 1];
        }
        if (greg_month < 1) {
            greg_month += 12;
            greg_year -= 1;
        }
        return new Date(greg_year, greg_month - 1, greg_day, hour, minute);
    }
    function getCalendarFormatedDate(date){
        var greg_year = date.getFullYear();
        var greg_month = date.getMonth() + 1;
        var greg_day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        if (hour < 10) hour = "0" + hour;
        if (minute < 10) minute = "0" + minute;
        if (greg_month < 10) greg_month = "0" + greg_month;
        if (greg_day < 10) greg_day = "0" + greg_day;
        return greg_year + "" + greg_month + "" + greg_day + "T" + hour + minute + "00" + "Z";
    }
    function addCalendarButton(){ // add a button to the page to add the assignment to the google calendar
        // find course's name, div with class="page-header-headings"
        var divs2 = document.getElementsByClassName("page-header-headings");
        if (divs2.length == 0) return;

        // find h1 tag inside the div
        var h1s = divs2[0].getElementsByTagName("h1");
        var courseName = h1s[0].innerHTML.split("-")[0].trim();

        // find assignment's name, the first h2
        var h2s = document.getElementsByTagName("h2");
        var assignmentName = h2s[0].innerHTML;

        // find due date
        // find table with class="generaltable"
        var tables = document.getElementsByClassName("generaltable");
        // find tr with th="مهلت تحویل"
        var trs = tables[0].getElementsByTagName("tr");
        var tr = null;
        for (var i = 0; i < trs.length; i++) { // find the row with "مهلت تحویل"
            var ths = trs[i].getElementsByTagName("th");
            if (ths.length == 0) continue;
            if (ths[0].innerHTML == "مهلت تحویل") {
                tr = trs[i];
                break;
            }
        }
        if (tr == null) return; // no due date found
        var tds = tr.getElementsByTagName("td");
        if (tds.length == 0) return; // no due date found
        var dueDateText = tds[0].innerHTML; 
        // get the rest of string after the first comma
        var dueDateText = dueDateText.substring(dueDateText.indexOf('، ') + 1);
        var dueParsedDate = parseDateText(dueDateText);
        var dueGregDate = convertToGregorian(dueParsedDate[0], dueParsedDate[1], dueParsedDate[2], dueParsedDate[3], dueParsedDate[4]);
        var dueDate = getCalendarFormatedDate(dueGregDate);
        
        // get submission date, find div with class="fileuploadsubmissiontime"
        var divs3 = document.getElementsByClassName("fileuploadsubmissiontime");
        var submissionDate = getCalendarFormatedDate(new Date()); // set current date as submission date
        if (divs3.length != 0) {
            // find span inside the div
            var submissionDateText = divs3[0].innerHTML;
            var subParsedDate = parseDateText(submissionDateText);
            var submissionGregDate = convertToGregorian(subParsedDate[0], subParsedDate[1], subParsedDate[2], subParsedDate[3], subParsedDate[4]);
            submissionDate = getCalendarFormatedDate(submissionGregDate);
        }

        var button = getCalendarButton(courseName + " - " + assignmentName, submissionDate+ "/" + dueDate);
        
        // find div with role="main"
        var divs = document.querySelectorAll("div[role='main']");
        if (divs.length == 0) return;
        // add button to the div with role="main" as the first child
        divs[0].prepend(button);
    }

    var url = window.location.href;
    // if we are in a course page
    if(url.includes("course/view.php")){
        addTeacherName();
        addCourseDescription();
        addNoticeBoard();
        addAssignmentsDetails();
    } else if (url.includes("assign/view.php")){
        addCalendarButton();
    }
    fixDropdownMenuWidth();
})();