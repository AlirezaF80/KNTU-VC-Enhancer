// ==UserScript==
// @name         KNTU VC Enhancer
// @namespace    http://vc.kntu.ac.ir/
// @version      0.1
// @description  Fix some UI/UX Bugs of VC
// @author       AlirezaF
// @match        *://vc4012.kntu.ac.ir/*
// @match        *://vc4011.kntu.ac.ir/*
// @match        *://vc4002.kntu.ac.ir/*
// @match        *://vc4001.kntu.ac.ir/*
// @match        *://vc3992.kntu.ac.ir/*
// @match        *://vc3991.kntu.ac.ir/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.ir
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    function fixDropdownMenuWidth() {
        // find all divs with class="dropdown-menu ..." and set max-width=350px
        var divs = document.getElementsByClassName("dropdown-menu")
        // console.log(divs);
        for(var i = 0; i < divs.length; i++) {
            divs[i].setAttribute("style", "max-width: 350px;");
        }
    }
    function addNoticeBoard(){
        // get current url
        var url = window.location.href;
        // if we are in a course's page
        if(!url.includes("course/view.php")){
            return;
        }
        // add notice board's page details inside the course's page
        // first find the url of the notice board's page
        var noticeBoardUrl = null;
        // find li with class="activity forum modtype_forum" and get the first a tag
        var lis = document.getElementsByClassName("activity forum modtype_forum");
        if(lis.length > 0){
            var as = lis[0].getElementsByTagName("a");
            if(as.length > 0){
                noticeBoardUrl = as[0].href;
            }
        }
        if(noticeBoardUrl == null){
            return;
        }

        // get the div with role="main" inside noticeBoardUrl
        var xhr = new XMLHttpRequest();
        xhr.open("GET", noticeBoardUrl, false);
        xhr.send();
        var response = xhr.responseText;
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        var mainDiv = doc.querySelector("div[role='main']");
        
        // add the mainDiv to the current page
        var mainDivs = document.querySelectorAll("div[class='course-content']");
        // add the mainDiv as the first child of the first mainDiv
        mainDivs[0].prepend(mainDiv);
    }

    addNoticeBoard();
    fixDropdownMenuWidth();
})();