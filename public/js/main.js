$(document).ready(function(){

    String.prototype.toDOM=function(){
        var d=document
            ,i
            ,a=d.createElement("div")
            ,b=d.createDocumentFragment();
        a.innerHTML=this;
        while(i=a.firstChild)b.appendChild(i);
        return b;
    };

    let cat_text = document.getElementsByClassName('cat_text')[0];
        cat_text.innerHTML = $('<textarea />').html(cat_text.textContent.toDOM()).text();

    $('.owl-carousel').owlCarousel({
        loop:true,
        margin:10,
        // autoWidth:true,
        autoHeight:true,
        responsiveClass:true,
        responsive:{
            0:{
                items:1,
                nav:false
            },
            600:{
                items:1,
                nav:false
            },
            1000:{
                items:1,
                nav:false,
                loop:false
            }
        }
    });



});



