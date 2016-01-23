
function template(id) {
    return function(_, obj) {
	$("#main").append($(id).html().replace(/{(.*?)}/g, function(match, code) { 
	    var tmp = obj;
	    code = code.split(".");
	    for(i in code) {
		tmp = tmp[code[i]];
	    }
	    return tmp;
	}));
    };
};

function get(url, id){
    $.getJSON(url, function(data) {
	$("#main").empty(); 
	$.each(data, template("#" + id)); 
    });
}

$(document).ready(function () {
    
    get("/api/tweets", "tweet-template");
    

    $(".view_tweets").click(function (){
	get("/api/tweets", "tweet-template");
    });
    
    $(".view_users").click(function (){
	get("/api/users", "user-template");
    });
    
    $(".view_extlinks").click(function (){
	get("/api/extlinks", "extlink-template");
    });
    $(".view_location").click(function (){
	get("/api/location", "location-template");
    });
    
    $("#main").on("click",".user",function (){
	get("/api/user?id=" + $(this).attr("id"), "user-template");
    });
    $("#main").on("click",".tweet",function (){
	get("/api/tweet?id=" + $(this).attr("id"), "tweet-template");
    });
    $("#main").on("click",".clickable",function (){
	return false;
    });
    
    $("#main").on("mouseover",".list-group-item", function(){
		$(this).css("background-color", "#BBDDFF");
    });
    
    $("#main").on("mouseout",".list-group-item", function(){
		$(this).css("background-color", "");
    });
});
