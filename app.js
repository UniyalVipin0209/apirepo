//const _utility = require("./utility.js");
var createError = require("http-errors");
const request = require("request-promise");
const express = require("express");
const myappstart = express();
const logger = require("./logger.js");
const TIME_INTERVAL=1600;

require("dotenv").config({ path: __dirname + "/.env" });

myappstart.use(function (err, req, res, next) {
  if (err.status == 404)
    return next(createError(404, "Record does not available"));
  else if (err.status == 406) return next(createError(406, err.message));
  next();
});

const requestOptions = (req,uri) =>{
  return  {
      method: 'GET',
      uri: uri,
      body: req.body,
      json: true,
      headers: {
          'Content-Type': 'application/json'
       }
  };
}

myappstart.get("/api/Information", (req, res) => {
 
  // if (
  //   req.query.starShipName == undefined ||
  //   req.query.starShipName.length == 0 ||
  //   req.query.peopleName == undefined ||
  //   req.query.peopleName.length == 0
  // ) {
  //   res.send("Invalid Params");
  // }
  let finalData = {};

  // let starShipName = req.query.starShipName;
  // let peopleName = req.query.peopleName;

  //  console.log(starShipName, peopleName);

  

  //  console.log("P1 :", p1);
//Prom 1
  const p1= new Promise((resolve,reject)=>{
       let option1= requestOptions(req, starshipURL);
       let starShipName='Death Star';
 
       setTimeout(()=>{
            request(option1).then(response=> {
            if(response.results !=undefined){
               var starshipMatched= Object.values(response.results).find(item=> (item.name === starShipName));              
               
                if(!starshipMatched)  {
                    compositeObj= {} // empty object
                    reject(
                        {
                            message:"No Matching Data for input Space Craft!!",
                            status: 'P1_DNAGSS',
                            obj:compositeObj
                        }
                    );
                }                 
                else {
                    let crewStr= (!starshipMatched.crew? '0': starshipMatched.crew);
                    compositeObj= {
                    'starShip': {
                        'name':starshipMatched.name,
                        'model': starshipMatched.model
                    }, 
                    'crew' : crewStr 
                    }  
                    resolve(compositeObj);                               
                }              
            };

           })

        }, TIME_INTERVAL);
    });
//Prom 1  
//p2
  const p2 = new Promise((resolve,reject)=>{
    let peopleName = "Leia Organa";
    let option= requestOptions(req, peopleURL);
    let tempObj ={ };
       setTimeout(()=>{
        request(option).then(response=> {
               
        if(response.results !=undefined){
            var peopleMatch= Object.values(response.results).find(item=> (item.name === peopleName));
           
            if(!peopleMatch) {
                tempObj={
                    isMatched:false,
                    endPoints:''
                };
                 console.log(`Promise 2 -Unde, No Matched Data from getPeopleDetails ${peopleName}!!`)        
                reject({
                    message:`No Matched Data from getPeopleDetails ${peopleName}!!` ,
                    status: 'P3_DNAGPD' //Data Not Available for peopleURL
                })
            }
            else {
                  
                tempObj={
                    isMatched:true,
                    endPoints: peopleMatch.homeworld
                }
                 console.log(`yes Matched Data from getPeopleDetails ${peopleName}!!`)    
                resolve(tempObj); 
            }     
                           
        };
       
}).catch(err =>{
   console.log('Promise 2 is going to fail', err);
reject({
    message:`Error in accessing the endpoint for peopleURL`,
    status: 'P3_EPGPD' // EndPoint Not Exist for peopleURL
})
});
    },TIME_INTERVAL); // SetTimeOut
}); 

    p2.then((obj) => {
      // console.log("123", planetEndPoint);
      const planetName = "Alderaan";
      const planetURL= obj.endPoints;
       console.log('Promise 2 calling P3 ', planetURL)    
      let option1= requestOptions(req, planetURL);
      setTimeout(()=>{
        request(option1).then((resHW)=> {
            let tempObj={};               
             if(resHW !=undefined){                       
                var isLeinaOnPlanet= (resHW?.name === planetName);       
                 console.log('isLeinaOnPlanet :',isLeinaOnPlanet);
                var strTxt= (isLeinaOnPlanet == true) ?"": " NOT ";
                let tempMessage= `${planetName} is ${strTxt} available on Planet.`
                tempObj={
                  isLeinaOnPlanet : isLeinaOnPlanet,
                  secretMessage :   tempMessage
               }; 
                if(isLeinaOnPlanet==true ){
                    console.log(tempObj);               
                    resolve(tempObj); 
                }    
                else{
                   console.log(isLeinaOnPlanet ,tempObj);               
                  reject(tempObj);
                }
            }  
             
           })
        },TIME_INTERVAL);        
      }).then((peopleMatchedObj)=>{
        //Obj 1
        p1.then((result)=>{
             console.log("123456789", peopleMatchedObj);
            finalData.Starship = result.starShip;
            finalData.crew = result.crew;
            finalData.isLeinaOnPlanet = peopleMatchedObj.isLeinaOnPlanet;
            console.log('finalData ',finalData);
            res.status(200).send(JSON.stringify(finalData));
          }          
        ).catch((peopleMatchedObj)=>{           

            p1.then((result)=>{
               console.log("P2 Fail ", peopleMatchedObj);
              finalData.Starship = result.starShip;
              finalData.crew = result.crew;
             // finalData.isLeinaOnPlanet = peopleMatchedObj.isLeinaOnPlanet;
               console.log('finalData ',finalData);
              res.status(200).send(JSON.stringify(finalData));
            }          
          )
        });
      
      }).catch((err)=>{
         console.log('p2 pr issue', err);
         console.log(err);
    });
  
 
});

const starshipURL = "https://swapi.dev/api/starships/";
const peopleURL = "https://swapi.dev/api/people/";

const PORT = process.env.PORT || 5000;
myappstart.listen(PORT, () => logger.info(`Listening on port ${PORT}`));


