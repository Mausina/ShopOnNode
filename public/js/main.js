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

    if( typeof cat_text === "object"){
        cat_text.innerHTML = $('<textarea />').html(cat_text.textContent.toDOM()).text();
    }


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

    var stringUrl = window.location.href;
    var url = new URL(stringUrl);
    var page = '';

    if(url.pathname === '/subcategory'){
        page = url.searchParams.get("page") ? url.searchParams.get("page"): 0;
        console.log(url.searchParams.get("page"));

        $("a[rel='page-" + page + "']").parent('li').addClass('active');
        // // console.log(page);
        // // console.log(window.location);
    }


    $('#pagination a').click(function() {

        $('#pagination li.active').removeClass('active');

        $(this).parent('li').addClass('active');
        $('.' + $(this).attr('rel')).addClass('active');

        let urlForPagination = $('.' + $(this).attr('rel'));
        // console.log(urlForPagination[0].attributes[1].value);
        // console.log(window.location);
        window.location.href = window.location.origin + urlForPagination[0].attributes[1].value;
        return false;
    });
});


