/**
 * @license @title XTag Manager: AT Internet SmartTag Adapter
 * @author DENIS ROUSSEAU
 * @version 8.2.1
 */
/*jslint nomen: true, plusplus: true, vars: true, evil: true, regexp: true*/

/**
 * SmartTag Adapter
 * @namespace
 */
var stat_stag =
{
    tag:null,
    /**
     * Initialize AT Internet Tracker
     * @param {boolean} secured Optional: Forced Secure?  
     * @param {boolean} nocookie Optional: Cookie opt-out?
     * @param {string} cookieDomain Optional: Domain to use for cookie
     * @param {boolean} noreset Optional: prevent page reset when SmartTag already created
     **/        
    init:function(secured, nocookie, cookieDomain, noreset)
    {
        stat_stag.initCookie(nocookie);
        if (stat_stag.tag)
        {            
            if (!noreset)
            {
                stat_stag.tag.setContext("page",{});
            }            
        }
        else if (typeof STAT_Method==='object')
        {
            var dom=window.xtsd? (xtsd + stat_stag.collectDomain()) : '',
                ax=dom.split('//'),cd=ax.length>1?ax[1]:ax[0],p={
                site:xtsite,
                secure:(typeof secured==='boolean')?secured:('https:'===document.location.protocol),
                cookieDomain:cookieDomain||stat_stag.cookieDomain(),
                collectDomain:cd,
                collectDomainSSL:cd                
            };          
            stat_stag.tag = new ATInternet.Tracker.Tag(p);
        }
        else
        {  
            stat_stag.tag = new ATInternet.Tracker.Tag();
        }       
    },
    /**
     * Init checker: as Init, but without reset 
     */    
    initCheck:function()
    {
        stat_stag.init(null,null,null,true);         
    },
    /**
     * Cookie mode setting 
     */
    initCookie : function(nocookie)
    {
        if (typeof nocookie === 'boolean')
        {
            if (nocookie)
            {
                ATInternet.Utils.userOptedIn();
            }
            else
            {
                ATInternet.Utils.userOptedOut();
            }
        }           
    },
    /**
     * Return the domain from current subdomain
     */
    cookieDomain : function()
    {
        var ah=window.location.hostname.split('.'), n=(ah[ah.length-1].length===2)?3:2;
        return '.'+ah.slice(-n).join('.');        
    },
    /**
     * Complete ATI Domain collector 
     */
    collectDomain : function()
    {
        var p=0;
        return (window.xtsd && xtsd.indexOf('.')>0)?'':((!window.xtsd || ((p=xtsd.indexOf('log'))>=0 && xtsd.charAt(p+3)!=='w'))?'.xiti.com':'.ati-host.net')  ;
    },
    /**
     * Retrieve parameter parser in given URL (parameters can be retrieved in lowercase)
     * @param {string} surl URL to parse
     * @return {object} The map which contains parsed parameters. Use as object[parameter], with parameter in lower case
     */
    getUrlParser : function(surl)
    {
        var osurl = {};
        surl.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function(b, a, d, c)
        {
            osurl[a.toLowerCase()] = c;
        });
        return osurl;
    },    
    /**
     * Parse xtcore parameters to make them SmartTag settings.  
     **/     
    setParams:function()
    {
         if (stat_stag.tag)
         {
             if (typeof window.xt_cart==='function')
             {
                 xt_cart();
             }
             var i=0,ap=window.xtparam?xtparam.split('&'):[],av=[],t='',v=null,cs=null,cp=null,cv=null,vi=null,is=null,sc=null,so=null,
             z=(!window.xttp || window.xttp !== 'conf1');
             for (i=0;i<ap.length;i++)
             {
                av=ap[i].split('=');                
                switch(av[0])
                {
                /* Visitor Identified */
                case 'an':
                    vi=vi||{};vi.id=parseInt(av[1],10);break;
                case 'at':
                    vi=vi||{};vi.id=av[1];break;
                case 'ac':
                    vi=vi||{};vi.category=av[1];break;
                /* Internal Search */
                case 'mc':
                    is=is||{};is.keyword=av[1];break;
                case 'np':
                    is=is||{};is.resultPageNumber=av[1];break;
                /* Sales Tracker Cart */
                case 'tp':
                    sc=sc||{};sc.isBasketPage=(av[1]==='cart'||av[1]==='pre1');break;
                case 'idcart':
                    sc=sc||{};sc.cartId=av[1];break;
                /* Sales Tracker Order */                    
                case 'cmd':
                    so=so||{};so.orderId=av[1];break;
                case 'newcus':
                    so=so||{};so.newCustomer=av[1];break;
                case 'roimt':
                    if(z||(1*av[1])){so=so||{};so.turnover=av[1];}break;
                case 'mp':
                    so=so||{};so.paymentMethod=av[1];break;
                case 'st':
                    so=so||{};so.status=av[1];break;                                     
                case 'mtht':
                    if(z||(1*av[1])){so=so||{};so.amount=so.amount||{};so.amount.amountTaxFree=av[1];}break;
                case 'mtttc':
                    if(z||(1*av[1])){so=so||{};so.amount=so.amount||{};so.amount.amountTaxIncluded=av[1];}break;
                case 'tax':
                    if(z||(1*av[1])){so=so||{};so.amount=so.amount||{};so.amount.taxAmount=av[1];}break; 
                case 'fpht':
                    if(z||(1*av[1])){so=so||{};so.delivery=so.delivery||{};so.delivery.shippingFeesTaxFree=av[1];}break;                             
                case 'fp':
                    if(z||(1*av[1])){so=so||{};so.delivery=so.delivery||{};so.delivery.shippingFeesTaxIncluded=av[1];}break;  
                case 'dl':
                    so=so||{};so.delivery=so.delivery||{};so.delivery.deliveryMethod=av[1];break;
                case 'pcd':
                    so=so||{};so.discount=so.discount||{};so.discount.promotionalCode=av[1];break;
                case 'dscht':
                    if(z||(1*av[1])){so=so||{};so.discount=so.discount||{};so.discount.discountTaxFree=av[1];}break;  
                case 'dsc':
                    if(z||(1*av[1])){so=so||{};so.discount=so.discount||{};so.discount.discountTaxIncluded=av[1];}break;                                                                                          
                /* Custom Variables */
                default: 
                    if (av[0])
                    {
                        t=av[0].charAt(0);
                        v=av[0].replace(t,'');
                        if (!isNaN(v))
                        {
                            switch (t)
                            {
                            /* Site Custom Variables */
                            case 'x':
                                cs=cs||{};cs[v]=av[1];break;
                            /* Page Custom Variables */
                            case 'f':
                                cp=cp||{};cp[v]=av[1];break;            
                            }
                        }
                    }   
                    break;                                                                                    
                }           
             }
             if (cs)
             {
                 cv=cv||{};
                 cv.site=cs;
             }
             if (cp)
             {
                 cv=cv||{};
                 cv.page=cp;
             }    
             if (cv && stat_stag.tag.customVars)
             {       
                 stat_stag.tag.customVars.set(cv);
             }
             if (vi && stat_stag.tag.identifiedVisitor)
             {
                 stat_stag.tag.identifiedVisitor.set(vi);
             }
             if (is && is.keyword && stat_stag.tag.internalSearch)
             {
                 stat_stag.tag.internalSearch.set(is);
             }
             if (sc && stat_stag.tag.cart)
             {
                 stat_stag.tag.cart.set(sc);
             }                
             if (so && stat_stag.tag.order)
             {
                 if (z && window.xttp === 'pre1')
                 {
                     so.confirmationRequired=true;
                 }
                 stat_stag.tag.order.set(so);
                 if (!z)
                 {
                     stat_stag.tag.setParam("tp", "conf1");
                 }
             }             
        }
    },
    /**
     * Create a Json structure from a conventional name
     * @param {string} lname Page or Event name  
     **/        
    jsonName : function(lname)
    {
        var ax=lname.split('::'), p={}, i=0;
        p.name=(ax.length>0)?ax.pop():'';
        for (i=0; i<ax.length; i++)
        {
            p["chapter"+(i+1).toString()]=ax[i];
        }
        if (window.xtn2)
        {
            p.level2=xtn2;
        }   
        return p;     
    },  
    /**
     * Get a converted click type 
     */
    clickType : function(type)
    {
        return (type==='T')?'download':((type==='S')?'exit':((type==='N')?'navigation':'action'));
    },
    
    /**
     * Send Content Tag Marker
     **/            
    sendPage:function()
    {
        stat_stag.initCheck();
        if (stat_stag.tag.page)
        {            
            stat_stag.tag.page.set(stat_stag.jsonName(xtpage));
            stat_stag.setParams();
            stat_stag.tag.dispatch(); 
        }          
    },

    /**
     * Send Click Tag
     **/       
    sendClick:function(lname, type, node, e)
    {
        stat_stag.initCheck();
        var p=stat_stag.jsonName(lname),jp=null;  
        switch (type)
        {
        case 'F':    
            if (stat_stag.tag.page)
            {       
                stat_stag.tag.page.send(p);
            }
            break;
        case 'IS':
            if (stat_stag.tag.internalSearch)
            {
                jp=stat_stag.getUrlParser(lname);
                if (jp && jp.mc && !isNaN(jp.np) && !isNaN(jp.mcrg))
                {
                    stat_stag.tag.internalSearch.send({elem:node,keyword:jp.mc,resultPageNumber:jp.np,resultPosition:jp.mcrg});
                }
            }
            break;
        default:
            if (stat_stag.tag.click)
            {
                p.type=stat_stag.clickType(type);
                p.elem=node;  
                stat_stag.tag.click.send(p);
            }
            break;                 
        }     
    },

    /**
     * Send Rich Media Tag for Video
     **/       
    sendVideo:function(A,B,C,D,E,F,G,H,I,J,K,L,M,N,event)
    {
        stat_stag.initCheck();
        if (stat_stag.tag.richMedia)
        {        
            var id=parseInt(A.split('=')[1],10),an=C.split('::'),act=D.split('&')[0],
            label=an.length>1?an[1]:an[0],theme=an.length>1?an[0]:'',p=event?event.target:{},sp=null;
            if (!p.added)
            {
                stat_stag.tag.richMedia.add(
                {
                    mediaType: 'video',
                    playerId: id,
                    mediaLevel2: B,
                    mediaLabel: label,
                    mediaTheme1: theme,
                    isEmbedded: true,
                    webdomain: (p.a && p.a.src)?p.a.src.split('?')[0]:'',
                    broadcastMode: L,
                    duration: G,
                    refreshDuration: {'0':5,'1':15,'5':30,'10':60}
                });
                p.added=true;
            }
            sp={action: act, playerId: id, mediaLabel: label, mediaTheme1: theme};
            if (act==='info')
            {
                sp.isBuffering=(D.indexOf('buf=1')>=0);
            }
            stat_stag.tag.richMedia.send(sp);
        }        
    },
    
    /**
     * Force Video stop 
     */
    stopVideo:function()
    {
        if (stat_stag.tag && stat_stag.tag.richMedia)
        {
            stat_stag.tag.richMedia.removeAll();
        }
    },
    
    /**
     * Product impression
     */       
    productView: function(pRef, pName, catRef, catName)
    {
        if (stat_stag.tag && stat_stag.tag.product && pRef)
        {
            var p={productId: pRef + (pName?('['+pName+']'):'')};
            if (catRef && !isNaN(catRef))
            {
                p.category1=catRef + (catName?('['+catName+']'):'');
            }
            stat_stag.tag.product.add(p);  
        }      
    },
  
    /**
     * Product adding
     */ 
    addProduct:function(product) 
    {
        if (stat_stag.tag && stat_stag.tag.cart && product && product.ID)
        {
            stat_stag.tag.cart.add({product:{
              productId: product.ID + (product.Description?('['+decodeURIComponent(product.Description)+']'):''),
              category1: product.Category||'',
              unitPriceTaxFree: product.UnitPriceTF||'0',
              unitPriceTaxIncluded: product.UnitPriceTI||'0',
              discountTaxIncluded:product.DiscountTI,
              discountTaxFree:product.DiscountTF,
              quantity: product.Quantity||'1'
            }}); 
        }  
    }
};
/**
 * xtcore definitions 
 */
(function()
{
    window.xt_med=function(mode,l2,name,type)
    {
        stat_stag.initCheck();    
        if (stat_stag.tag.click && mode==='C')
        {
            var p=stat_stag.jsonName(name);
            p.type=stat_stag.clickType(type);
            p.level2=l2;
            stat_stag.tag.click.send(p);  
        }   
    };
    window.xt_click=function(node,mode,l2,name,type,target,newpage,stc)
    {
        stat_stag.initCheck();
        if (stat_stag.tag.click)
        {
            var p=stat_stag.jsonName(name);
            p.level2=l2;
            if (stc)
            {
                p.customObject=stc;
            }            
            if (mode==="F")
            {
                stat_stag.tag.page.send(p);
            }
            else if (mode==='C')
            {
                p.type=stat_stag.clickType(type);
                p.elem=(node && (node.tagName==='A'||node.tagName==='FORM'))?node:null;
                stat_stag.tag.click.send(p);  
            }
        }   
        return true;
    };
    window.xt_form=function(node,mode,l2,name,type,dosubmit,stc)
    {
        xt_click(node,mode,l2,name,type,null,null,stc);  
        if (dosubmit && node.submit)
        {
            setTimeout(function(){node.submit();}, 500);
            return false;
        }  
        return true;
    };
    window.xt_addProduct_load=function(cat,product)
    {
        stat_stag.initCheck();
        if (product && stat_stag.tag && stat_stag.tag.product)
        {
            var p={category1:cat, productId: product};
            stat_stag.tag.product.add(p);  
        }   
    };
    window.xt_rm=function(A,B,C,D,E,F,G,H,I,J,K,L,M,N)
    {
        stat_stag.sendVideo(A,B,C,D,E,F,G,H,I,J,K,L,M,N);
    };
})();

/**
 *  Content page tag trigger
 *  To include in a Tag Manager, preferably:
 *  - Split the code above to be included in earlier in page (just after smarttag.js), 
 *  - Add the lines belows instead of xtcore.js inclusion
 */
(function()
{
    stat_stag.init();
    stat_stag.sendPage();
})();
