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
    const jy = j_y - 979;
    const jm = j_m - 1;
    const jd = j_d - 1;
    let j_day_no = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4);
    for (let i = 0; i < jm; ++i) j_day_no += JalaliDate.j_days_in_month[i];
    j_day_no += jd;
    let g_day_no = j_day_no + 79;
    let gy = 1600 + 400 * parseInt(g_day_no / 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
    g_day_no = g_day_no % 146097;
    let leap = true;
    if (g_day_no >= 36525) { /* 36525 = 365*100 + 100/4 */
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
    let gm = i + 1;
    let gd = g_day_no + 1;
    gm = gm < 10 ? "0" + gm : gm;
    gd = gd < 10 ? "0" + gd : gd;
    return [gy, gm, gd];
};
(function() {
    'use strict';
    function getHTMLDoc(url, callback) {
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
        // fix firs div with class="dropdown-menu ..."
        const dropdownMenuDivs = document.getElementsByClassName("dropdown-menu");
        dropdownMenuDivs[0]?.setAttribute("style", "left: -100%;");
    }
    function addNoticeBoard() {
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
    function addCourseDescription() {
        // get course description
        // find div with class="coursesummary"
        const courseSummaryDivs = document.querySelectorAll(".coursesummary");
        // find div with class="text_to_html"
        const courseDescription = courseSummaryDivs[0]?.querySelector(".text_to_html")?.innerHTML ?? "";
        // add course description to the page
        // add a ul with class="breadcrumb" to div with id="page-navbar"
        const ul = document.createElement("ul");
        ul.setAttribute("class", "breadcrumb");
        // add course description to the ul
        const li = document.createElement("li");
        li.innerHTML = courseDescription;
        ul.appendChild(li);
        const navbarDiv = document.getElementById("page-navbar");
        navbarDiv.appendChild(ul);
    }
    function addTeacherName() {
        // get teacher name
        // find div with class="staffmember"
        // find first div with class="staffinfo"
        // get the text
        const staffMemberDivs = document.querySelectorAll(".staffmember");
        const staffInfoDivs = staffMemberDivs[0]?.querySelectorAll(".staffinfo");
        // find h4 tag inside the div
        const h4s = staffInfoDivs[0]?.getElementsByTagName("h4");
        const teacherName = h4s[0]?.innerHTML;
        // add teacher name to the page
        // find div with class="page-header-headings"
        // append teacher name to the h1 tag inside the div
        const pageHeaderHeadingsDivs = document.querySelectorAll(".page-header-headings");
        let courseNameHeader = pageHeaderHeadingsDivs[0]?.getElementsByTagName("h1");
        if(courseNameHeader.length == 0) return;
        courseNameHeader[0].innerHTML += " - " + teacherName;
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

    function getCalendarButton(name, date) {
        var calendarButton = document.createElement("button");
        calendarButton.innerHTML = "اضافه کردن به تقویم";
        calendarButton.onclick = function() {
            var url = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + name + "&dates=" + date;
            window.open(url, '_blank');
        }
        calendarButton.setAttribute("class", "btn btn-primary");
        calendarButton.style.float = "left";
        return calendarButton;
    }
    function parseDateText(dateText) {
        const dueDateParts = dateText.split('، ');
        const date = dueDateParts[0].trim();
        const time = dueDateParts[1].trim();
        // get persian date
        const dateParts = date.split(' ');
        const j_day = parseInt(dateParts[0]);
        const j_monthText = dateParts[1];
        const j_year = parseInt(dateParts[2]);
        let j_month = 0;
        for (let i = 0; i < JalaliDate.MONTHS.length; i++) {
            if (JalaliDate.MONTHS[i] == j_monthText) {
                j_month = i + 1;
                break;
            }
        }
        // get time
        const timeParts = time.split(' ');
        let hour = parseInt(timeParts[0].split(':')[0]);
        const minute = parseInt(timeParts[0].split(':')[1]);
        const amPM = timeParts[1];
        if (amPM == "عصر") {
            hour += 12;
        }
        return [j_year, j_month, j_day, hour, minute];
    }
    function convertToGregorian(j_year, j_month, j_day, hour, minute) {
        // convert jalali date to gregorian date
        let gregorianDate = JalaliDate.toGregorian(j_year, j_month, j_day);
        let greg_year = gregorianDate[0];
        let greg_month = gregorianDate[1];
        let greg_day = gregorianDate[2];
        
        // convert time to UTC
        // get current time zone
        let timeZone = new Date().getTimezoneOffset();
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
    function getGoogleFormattedDate(date) {
        let greg_year = date.getFullYear();
        let greg_month = date.getMonth() + 1;
        let greg_day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        if (hour < 10) hour = "0" + hour;
        if (minute < 10) minute = "0" + minute;
        if (greg_month < 10) greg_month = "0" + greg_month;
        if (greg_day < 10) greg_day = "0" + greg_day;
        return greg_year + "" + greg_month + "" + greg_day + "T" + hour + minute + "00" + "Z";
    }
    function addCalendarButton() { // add a button to the page to add the assignment to the google calendar
        // find course's name, div with class="page-header-headings"
        const divs2 = document.getElementsByClassName("page-header-headings");

        // find h1 tag inside the div
        const h1s = divs2[0]?.getElementsByTagName("h1");
        const courseName = h1s[0]?.innerHTML.split("-")[0].trim();

        // find assignment's name, the first h2
        const h2s = document.getElementsByTagName("h2");
        const assignmentName = h2s[0]?.innerHTML;

        // find due date
        // find table with class="generaltable"
        const tables = document.getElementsByClassName("generaltable");
        // find tr with th="مهلت تحویل"
        const rows = tables[0]?.getElementsByTagName("tr");
        let dueDateRow = null;
        for (var i = 0; i < rows.length; i++) { // find the row with "مهلت تحویل"
            var ths = rows[i].getElementsByTagName("th");
            if (ths.length == 0) continue;
            if (ths[0].innerHTML == "مهلت تحویل") {
                dueDateRow = rows[i];
                break;
            }
        }
        const cells = dueDateRow?.getElementsByTagName("td");
        let dueDateText = cells[0]?.innerHTML;
        dueDateText = dueDateText.substring(dueDateText.indexOf('، ') + 1);// remove the weekday from the text
        const dueParsedDate = parseDateText(dueDateText);
        const dueGregDate = convertToGregorian(dueParsedDate[0], dueParsedDate[1], dueParsedDate[2], dueParsedDate[3], dueParsedDate[4]);
        const dueDate = getGoogleFormattedDate(dueGregDate);
        
        // get submission date, find div with class="fileuploadsubmissiontime"
        const fileUploadTimeDivs = document.getElementsByClassName("fileuploadsubmissiontime");
        let submissionDate = getGoogleFormattedDate(new Date()); // set current date as submission date
        if (fileUploadTimeDivs.length != 0) { // if there is a submission date, use it
            const submissionDateText = fileUploadTimeDivs[0].innerHTML;
            const subParsedDate = parseDateText(submissionDateText);
            const submissionGregDate = convertToGregorian(subParsedDate[0], subParsedDate[1], subParsedDate[2], subParsedDate[3], subParsedDate[4]);
            submissionDate = getGoogleFormattedDate(submissionGregDate);
        }

        const calendarButton = getCalendarButton(courseName + " - " + assignmentName, submissionDate+ "/" + dueDate);
        
        // find div with role="main"
        const divs = document.querySelectorAll("div[role='main']");
        // add button to the div with role="main" as the first child
        divs[0]?.prepend(calendarButton);
    }

    const url = window.location.href;
    // if we are in a course page
    if(url.includes("course/view.php")) {
        addTeacherName();
        addCourseDescription();
        addNoticeBoard();
        addAssignmentsDetails();
    } else if (url.includes("assign/view.php")) {
        addTeacherName();
        addCourseDescription();
        addCalendarButton();
    }
    fixDropdownMenuWidth();
})();