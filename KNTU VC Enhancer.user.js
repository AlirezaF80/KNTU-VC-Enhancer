// ==UserScript==
// @name         KNTU VC Enhancer
// @namespace    http://vc.kntu.ac.ir/
// @version      0.3
// @description  Adds new features and fixes bugs of KNTU VC
// @author       AlirezaF
// @match        *://vc4012.kntu.ac.ir/*
// @match        *://vc4011.kntu.ac.ir/*
// @match        *://vc4002.kntu.ac.ir/*
// @match        *://vc4001.kntu.ac.ir/*
// @match        *://vc3992.kntu.ac.ir/*
// @match        *://vc3991.kntu.ac.ir/*
// @match        *://vc*.kntu.ac.ir/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.ir
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    function getHTMLDoc(url){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        var response = xhr.responseText;
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        return doc;
    }
    function fixDropdownMenuWidth() {
        // find all divs with class="dropdown-menu ..." and set max-width=350px
        var divs = document.getElementsByClassName("dropdown-menu")
        // console.log(divs);
        for(var i = 0; i < divs.length; i++) {
            divs[i].setAttribute("style", "max-width: 300px;");
        }
    }
    function addNoticeBoard(){
        // add notice board's page details inside the course's page
        // first find the url of the notice board's page
        var noticeBoardUrl = null;
        // find li with class="activity forum modtype_forum" and get the first a tag
        var lis = document.getElementsByClassName("activity forum modtype_forum");
        if(lis.length > 0){
            var as = lis[0].getElementsByTagName("a");
            if(as.length > 0) noticeBoardUrl = as[0].href;
        }
        if(noticeBoardUrl == null) return;
        // get the div with role="main" inside noticeBoardUrl
        var doc = getHTMLDoc(noticeBoardUrl);
        var mainDiv = doc.querySelector("div[role='main']");
        // add the mainDiv to the current page
        var mainDivs = document.querySelectorAll("div[class='course-content']");
        // add the mainDiv as the first child of the first mainDiv
        mainDivs[0].prepend(mainDiv);
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
    function addAssignmentsDetails(){
        // first find all divs with class="activityinstance"
        var divs = document.getElementsByClassName("activityinstance");
        if (divs.length == 0) return;
        // for each div, find the first a tag, get the href attribute
        for(var i = 0; i < divs.length; i++){
            var as = divs[i].getElementsByTagName("a");
            if(as.length == 0) continue;
            var url = as[0].href;
            if (!url.includes('mod/assign')) continue;
            // get the div with class="submissionstatustable" inside the url
            var doc = getHTMLDoc(url);
            var submissionstatustable = doc.getElementsByClassName("submissionstatustable");
            if(submissionstatustable.length == 0) continue;
            var trs = submissionstatustable[0].getElementsByTagName("tr");
            if(trs.length < 4) continue;
            var tds = trs[trs.length-3].getElementsByTagName("td");
            if(tds.length == 0) continue;
            var classList = tds[0].classList;
            var backCol, fontCol;
            if (classList.contains("earlysubmission")){
                backCol = "#cfefcf";
                fontCol = "#0f4d0f";
            } else if (classList.contains("latesubmission")){
                as[0].innerHTML += " (با تاخیر)";
                backCol = "#ffff99";
                fontCol = "#666600";
            } else if (classList.contains("overdue")){
                backCol = "#efcfcf";
                fontCol = "#660000";
            }
            if (backCol != null && fontCol != null){
                divs[i].style.backgroundColor = backCol;
                as[0].style.color = fontCol;
            }
            // get the submission date
            var tds2 = trs[trs.length-4].getElementsByTagName("td");
            if(tds2.length == 0) continue;
            var submissionDate = tds2[0].innerText;
            // add submission date to the a tag
            as[0].innerHTML += " - " + submissionDate;
        }
    }
    var url = window.location.href;
    // if we are in a course page
    if(url.includes("course/view.php")){
        addTeacherName();
        addCourseDescription();
        addNoticeBoard();
        addAssignmentsDetails();
    }
    fixDropdownMenuWidth();
})();