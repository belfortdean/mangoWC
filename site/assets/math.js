/* Pure calculations shared by the UI and tests. All amounts use one currency. */
(function(root){
const finite=(v)=>typeof v==='number'&&Number.isFinite(v);
function yieldCalc(price,rent,costs,vacancy,annual){
 if(![price,rent,costs,vacancy,annual].every(finite)||price<=0||rent<0||costs<0||vacancy<0||vacancy>12||annual<0)throw Error('invalid');
 const basis=price+costs, gross=rent*12, net=rent*(12-vacancy)-annual;
 return {gross,net,grossYield:gross/price*100,netYield:net/basis*100,payback:net>0?basis/net:null};
}
function priceCalc(price,area){if(![price,area].every(finite)||price<0||area<=0)throw Error('invalid');return price/area;}
function rentBuy(price,rent,costs,maintenance,years){
 if(![price,rent,costs,maintenance,years].every(finite)||price<=0||rent<0||costs<0||maintenance<0||maintenance>100||years<=0||years>50)throw Error('invalid');
 return {rentTotal:rent*12*years,buyOutlay:price+costs+price*maintenance/100*years,annualMaintenance:price*maintenance/100,ratio:rent>0?price/(rent*12):null};
}
const api={yieldCalc,priceCalc,rentBuy};if(typeof module!=='undefined')module.exports=api;root.ResearchMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
