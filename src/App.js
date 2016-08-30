import React, { Component } from 'react';
import { Router, Route, Link } from 'react-router'
import {Breadcrumb} from 'react-bootstrap';

import './bootstrap/css/bootstrap.min.css';

const api_url = "https://cchdo.ucsd.edu/api/v1/pipe/site/microstructure.ucsd.edu";

var cruises = [];
const cruisesEvent = new Event("cruises");


function updateCruiseList(){
  fetch(api_url).then(function(response){
    response.json().then(function(json){
      cruises = json.cruises.sort(function(a, b){
        var a_sort_value = a.cruise.sites["microstructure.ucsd.edu"].name;
        var b_sort_value = b.cruise.sites["microstructure.ucsd.edu"].name;
        return a_sort_value.localeCompare(b_sort_value);
        });
      window.dispatchEvent(cruisesEvent);
    });
  });
};

function parseHash(hash){
  var h = hash.split("#/cruise/");
  if (h.length === 2){
    return h[1];
  } else {
    return NaN;
  }
}

function getCruiseByExpocode(expocode, cruises){
  for (var i=0; i < cruises.length; i++){
    if (cruises[i].cruise.expocode === expocode){
      return cruises[i].cruise;
    }
  }
  return null;
}
function getCruiseFilesByExpocode(expocode, cruises){
  for (var i=0; i < cruises.length; i++){
    if (cruises[i].cruise.expocode === expocode){
      return cruises[i].files;
    }
  }
  return null;
}
function listOrFiller(jsx_alm_array){
    if (jsx_alm_array.every(function(e){return e===undefined})){
      jsx_alm_array = (
          <li>-</li>
          )
    }
    return jsx_alm_array;

}

var CruisePage = React.createClass({
  cruiseListUpdate: function(e){
    this.setState({cruises:cruises});
  },
  getInitialState: function(){
    return {cruises:cruises}
  },
  componentDidMount: function(){
    window.addEventListener("cruises", this.cruiseListUpdate);
  },
  componentWillUnmount: function(){
    window.removeEventListener("cruises", this.cruiseListUpdate);
  },
  render: function(){
    if (this.state.cruises.length === 0){
      return <div>Loading...</div>
    }
    var cruise = getCruiseByExpocode(this.props.params.expocode, this.state.cruises);
    var files = getCruiseFilesByExpocode(this.props.params.expocode, this.state.cruises);

    var institutions = [];
    var hrp_owners= listOrFiller(cruise["participants"].map(function(person){
      if (person.role === "Microstructure PI"){
        if (institutions.indexOf(person.institution) === -1){
          institutions.push(person.institution);
        }
        return (
            <li key={person.name}>{person.name}</li>
            )
      }
    }));

    var chi_scis = listOrFiller(cruise["participants"].map(function(person){
      if (person.role === "Chief Scientist"){
        if (institutions.indexOf(person.institution) === -1){
          institutions.push(person.institution);
        }
        return (
            <li key={person.name}>{person.name}</li>
            )
      }
    }));

    institutions = listOrFiller(institutions.map(function(inst){
      return (
          <li key={inst}>{inst}</li>
          )
    }));
    

    var dataset = files.map(function(file){
      if (file.role === 'dataset' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={"http://cchdo.ucsd.edu" + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var reports = files.map(function(file){
      if (file.role === 'dataset' && file.data_type === 'documentation'){
      return (
          <li key={file.file_hash}><a href={"http://cchdo.ucsd.edu" + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var intermediate = files.map(function(file){
      if (file.role === 'intermediate' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={"http://cchdo.ucsd.edu" + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var raw = files.map(function(file){
      if (file.role === 'raw' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={"http://cchdo.ucsd.edu" + file.file_path}>{file.file_name}</a></li>
          )
      }
    });

    return (
        <div>
         <Breadcrumb>
           <Breadcrumb.Item href="#/">
             Programs
           </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {cruise.sites["microstructure.ucsd.edu"].name}
          </Breadcrumb.Item>
         </Breadcrumb>

        <dl className="dl-horizontal">
        <dt>Data Owner/PI</dt><dd><ul className="list-unstyled">{hrp_owners}</ul></dd>
        <dt>Chief Scientist(s)</dt><dd><ul className="list-unstyled">{chi_scis}</ul></dd>
        <dt>Dates</dt><dd>{cruise.startDate} - {cruise.endDate}</dd>
        <dt>Port Out</dt><dd>{cruise.start_port}</dd>
        <dt>Port In</dt><dd>{cruise.end_port}</dd>
        <dt>Ship</dt><dd>{cruise.ship}</dd>
        <dt>Institutions</dt><dd><ul className="list-unstyled">{institutions}</ul></dd>
        </dl>
        <h4>Dataset</h4>
        <ul>
          {dataset}
        </ul>
        <h4>Reports</h4>
        <ul>
          {reports}
        </ul>
        <h4>Data As Received</h4>
        <h5>Intermediate</h5>
        <ul>
          {intermediate}
        </ul>
        <h5>Raw</h5>
        <ul>
          {raw}
        </ul>
        </div>
        )
  }
});

var CruiseList = React.createClass({
  cruiseListUpdate: function(e){
    this.setState({cruises:cruises});
  },
  getInitialState: function(){
    return {cruises:cruises}
  },
  componentDidMount: function(){
    window.addEventListener("cruises", this.cruiseListUpdate);
  },
  componentWillUnmount: function(){
    window.removeEventListener("cruises", this.cruiseListUpdate);
  },
  render: function() {
    console.log(this.props);
    var programs = this.state.cruises.map(function (program){
      return (
          <li key={program.cruise.expocode}><Link to={`/cruise/${program.cruise.expocode}`}>{program.cruise.sites["microstructure.ucsd.edu"].name}</Link>
          </li>
          )
    });
    return (
      <div>
         <Breadcrumb>
           <Breadcrumb.Item active>
             Programs
           </Breadcrumb.Item>
         </Breadcrumb>
        <ul>
        {programs}
        </ul>
        </div>
        )
  }
});


var Microstructure = React.createClass({
  getInitialState: function() {
    return {
      cruises: []
    };
  },

  componentDidMount: function() {
    updateCruiseList();
  },

  render: function(){
    return (
        <div>
        <h3>microstructure.ucsd.edu</h3>
        <Router>
          <Route path="/" component={CruiseList} />
          <Route path="/cruise/:expocode" component={CruisePage} />
        </Router>
        </div>
        );
  }
});

class App extends Component {
  render() {
    var expocode = parseHash(window.location.hash);
    return (
      <Microstructure source="https://cchdo.ucsd.edu/api/v1/pipe/site/microstructure.ucsd.edu" expocode={expocode}/>
    )
  }
}

export default App;
