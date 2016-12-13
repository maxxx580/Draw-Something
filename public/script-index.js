$(document).ready(function(){
    $("#pwd, #pwdblank").hide();
    $("#inlineRadio2").click(function(){
        $("#pwd, #pwdblank").show(500);
    });

    $("#inlineRadio1").click(function(){
        $("#pwd, #pwdblank").hide(500);
    });
});