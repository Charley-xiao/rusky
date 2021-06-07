//loading json

var json="";
window.onload=function(){
    var url="src/js/words.json";
    var request=new XMLHttpRequest();
    request.open("get",url);
    request.send(null);
    request.onload=function(){
        if(request.status==200){
            json=JSON.parse(request.responseText);
        }
    }
}

//basics

function getrand(upsize){
    return parseInt(Math.random()*upsize+1);
}
function displayElement(eleName,vis){
	var eleId=document.getElementById(eleName);
	if(vis==1) eleId.style.display="";
	else eleId.style.display="none";
}
function showWarning(warnStr,vis){
	if(vis==0)displayElement("warning",0);
	else{
		displayElement("warning",1);
		document.getElementById("warningContent").innerHTML="<h2>"+warnStr+"</h2>";
	}
}

//initials

var configExp=1000;
var configNewLearn=20;

function setCookie(cname,cvalue,exdays){
    var d=new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires="expires="+d.toGMTString();
    document.cookie=cname+"="+cvalue+";"+expires+";path=/";
}
function getCookie(cname){
    var myname=cname+"=";
    var decodedCookie=decodeURIComponent(document.cookie);
    var ca=decodedCookie.split(';');
    for(var i=0;i<ca.length;i+=1) {
        var c=ca[i];
        while(c.charAt(0)==' ') c=c.substring(1);
        if (c.indexOf(myname)==0) return c.substring(myname.length,c.length);
    }
    return "";
}
function wordIsLearned(wordId){
	var learnedList=getCookie("list");
	if(learnedList.indexOf(wordId)==-1) return 0;
	return 1;
}
function setWordLearned(wordId){
	var learnedList=getCookie("list");
	learnedList=learnedList+","+wordId;
	setCookie("list",learnedList,configExp);
}
function setWordReview(wordId){
	var reviewList=getCookie("review");
	reviewList=reviewList+","+wordId;
	setCookie("review",reviewList,configExp);
}
function removeWordLearned(wordId){
	var learnedList=getCookie("list");
	var learnedArray=learnedList.split(',');
	var pos=learnedArray.indexOf(wordId);
	if(pos==-1) return "";
	learnedArray.splice(pos,1);
	var learnedString=learnedArray.toString();
	setCookie("list",learnedString,configExp);
}
function removeWordReview(wordId){
	var reviewList=getCookie("review");
	var reviewArray=reviewList.split(',');
	var pos=reviewArray.indexOf(wordId);
	if(pos==-1) return "";
	reviewArray.splice(pos,1);
	var reviewString=reviewArray.toString();
	setCookie("list",reviewString,configExp);
}
function clearLearnedList(){setCookie("list","",configExp);}
function clearReviewList(){setCookie("review","",configExp);}

//main

var wordLearned=-1;
var gottenArr=[];

function chooseWords(wordcnt,fromLearned){
	while(gottenArr.length>0) gottenArr.pop();
	var learnedList=getCookie("list");
	var learnedArray=learnedList.split(',');
	if(wordcnt>learnedArray.length){
		showWarning("超过最大值！",1);
		return;
	}
	var availableCnt=0;
	while(availableCnt!=wordcnt){
		var randId=getrand(learnedArray.length)-1;
		var rndIdS=randId.toString();
		if(fromLearned==0&&learnedArray.indexOf(rndIdS)==-1&&gottenArr.indexOf(rndIdS)==-1) gottenArr[availableCnt]=rndIdS,availableCnt++;
		if(fromLearned==1&&learnedArray.indexOf(rndIdS)!=-1&&gottenArr.indexOf(rndIdS)==-1) gottenArr[availableCnt]=rndIdS,availableCnt++;
	}
	for(var i=0;i<gottenArr.length;i++) console.log(gottenArr[i]);
}
function titleEnter(){
	document.getElementById("logo").style.top="10%";
    displayElement("options",1);
    var counterList=getCookie("list").split(';');
	var counterListLength=counterList.length;
	if(counterListLength>0&&counterList[0]!="") document.getElementById("wordCounter").innerHTML=counterListLength;
	else document.getElementById("wordCounter").innerHTML=0;
}
function displayNewWord(wordId){
	console.log(wordId);
	document.getElementById("newWordHolder").innerHTML=json.words[wordId].ru;

}
function addToLearnedList(){wordLearned=1;}
function addToReviewList(){wordLearned=0;}
async function learnNewWords(){
	displayElement("options",0);displayElement("logo",0);displayElement("mainLearnNew",1);
	var chosenWordCnt=configNewLearn;
	var validFlag=0;
	while(validFlag==0){
		document.addEventListener("keypress",e=>{
			if((e.keyCode==13||e.keyCode==1)&&fulfiller){
				fulfiller();
				fulfiller=null;
			}
		});
		async function haveInput(){
			return new Promise((fulfill,reject)=>{
				fulfiller=fulfill;
			});
		}
		await haveInput();
		let tempWordCnt=$("textarea#inputCnt").val();
		if(tempWordCnt===undefined||tempWordCnt==null){
			showWarning("输入不合法！",1);
			continue;
		}
		if(tempWordCnt>=1&&tempWordCnt<=100){
			validFlag=1;
			chosenWordCnt=tempWordCnt;
			continue;
		}
		showWarning("输入不合法！",1);
	}
	chooseWords(chosenWordCnt,0);
	displayElement("startLearnNew",1);displayElement("mainLearnNew",0);
	for(var i=1;i<=chosenWordCnt;i++){
		document.getElementById("navigate").innerHTML=i+"/"+chosenWordCnt;
		displayNewWord(gottenArr[i-1]);
		while(wordLearned<0){
			document.getElementById("nxtNewWord").addEventListener("click",e=>{
				if(fulfiller){
					fulfiller();
					fulfiller=null;
				}
			});
			async function nxtWord(){
				return new Promise((fulfill,reject)=>{
					fulfiller=fulfill;
				});
			}
			await nxtWord();
			if(wordLearned==0) setWordLearned(gottenArr[i-1]);
			else setWordReview(gottenArr[i-1]);
		}
		wordLearned=-1;
	}
}