import React, { Component } from 'react';
import { Router, Route, Link } from 'react-router'
import {Breadcrumb, Panel, Collapse} from 'react-bootstrap';

import './bootstrap/css/bootstrap.min.css';

const api_url = "https://cchdo.ucsd.edu/api/v1/pipe/site/microstructure.ucsd.edu";
const cchdo_url = "https://cchdo.ucsd.edu";

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

var IntroPane = React.createClass({
  getInitialState: function(){
    return {open:false}
  },
  render: function(){
    return(

      <Panel header={<h3>Welcome to the NSF-funded Microstructure Database</h3>}>
        <p>
          This database provides a compilation of various datasets obtained from ocean microstructure profilers capable of measuring the smallest scales of oceanic turbulence.
          <a onClick={ ()=> this.setState({ open: !this.state.open })}> more >></a>
        </p>

        <Collapse in={this.state.open}>
          <div>
            <p>
              Data from microstructure programs have been provided by the data owners (PIs) or has been digitized from historical papers. 
              For the data given from PIs, data has been archived as CF-compliant NETCDF files with 1-m binned data, where possible, saving the variables: time, depth, pressure, temperature, salinity, latitude, longitude as well as the newly designated variables: epsilon (ocean turbulent kinetic energy dissipation rate in W/kg), and when available, chi-t (ocean dissipation rate of thermal variance from microtemperature in degrees C<sup>2</sup>/s), and chi-c (ocean dissipation rate of thermal variance from microconductivity in degrees C<sup>2</sup>/s).
              Database entries include the program names and program PIs as well cruise information (research ship, ports of entry and exit, cruise dates, and chief scientist).
              Relevant cruise reports, program related papers and other documents are also contained in the data archive.
            </p>            
            <p>
              Data digitized from PEQUOD, PATCHEX, and WESPAC historical documents include mean profiles of dissipation. 
            </p>

            {/* 
                  <p>Database entries have project specific DOIs which should be cited when the data is used in publication.
                  </p>
                  */}

            <p>
              When available, additional supplementary data is provided such as shipboard ADCP and meteorological data.
              This data has been provided by the data owners (PIs) and has been included in the database as is without further quality checks by CCHDO.
            </p>
            <p>
              Newly obtained microstructure data can be uploaded to the microstructure database by sending 1-m binned data to the CCHDO group at <a href={cchdo_url + "/submit"}>{cchdo_url + "/submit"}</a>.
            </p>    
            <p>
              Citation for data sets that had pressure and/or depth cacluated using the GSW Oceanographic Toolbox:  McDougall, T.J. and P.M. Barker, 2011: Getting started with TEOS-10 and the Gibbs Seawater (GSW) Oceanographic Toolbox, 28pp., SCOR/IAPSO WG127, ISBN 978-0-646-55621-5. 
            </p>

            <p>
              As part of the Climate Process Team on internal wave driven mixing and creation of this microstructure database, a corresponding GitHub repository has been set up as a community supported and maintained set of best practice routines for calculating various mixing related variables. <a href="https://github.com/OceanMixingCommunity/Standard-Mixing-Routines">https://github.com/OceanMixingCommunity/Standard-Mixing-Routines</a>
            </p>
            <p>Andy Pickering wrote a python notebook to show how to extract the microstructure database data. This notebook, Examine_mixing_data.ipynb, contains examples of reading and plotting netcdf files in the mixing database with python. It is part of the Ocean Mixing Community GitHub repository Standard-Mixing-Routines. <a href="https://github.com/OceanMixingCommunity/Standard-Mixing-Routines/blob/master/Examine_mixing_data.ipynb">Reading Mixing Database Files with Python</a>
            </p>
          </div>
        </Collapse>
      </Panel>
    )
  }
})

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

    var expocode_link = <a href={cchdo_url + "/cruise/" + cruise.expocode}>{cruise.expocode}</a>;
    
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
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var reports = files.map(function(file){
      if (file.role === 'dataset' && file.data_type === 'documentation'){
      return (
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var intermediate = files.map(function(file){
      if (file.role === 'intermediate' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });

    var raw = files.map(function(file){
      if (file.role === 'raw' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });

    var intermediate_files = function(intermediate) {
      if (intermediate) {
        return (
          <div>
          <h5>Intermediate</h5>
          <ul>
            {intermediate}
          </ul>
          </div>
        )
      }
    }

    var raw_files = function(raw) {
      if (raw) {
        return (
          <div>
          <h5>Raw</h5>
          <ul>
            {raw}
          </ul>
          </div>
        )
      }
    }

    var supplemental_files = function(raw, intermediate) {
      if (raw | intermediate) {
        return (
          <div>
          <h4>Data As Received</h4>
          {intermediate_files}
          {raw_files}
          </div>
        )
      }
    }

    var references;
    if (cruise.hasOwnProperty("references")){

      references = listOrFiller(cruise["references"].map(function(ref){

      var href, text;
      var organization;
      var link = ref.value;
      var value = ref.value;

      if (ref.hasOwnProperty("properties")){
        for (const prop in ref.properties){
          if (prop == "href"){
            href = ref.properties.href;
          }
          if (prop == "text"){
            text = ref.properties.href;
          }
        }
      }
      if (ref.organization){
        organization = <b>({ref.organization})</b>;
      }
      if (ref.type == "link" || href){
        if (href){
          link = href;
        }
        if (text){
          value = text;
        }
        return (
          <li>{ref.type}: {organization} <a href={link}>{value}</a></li>
        )
      } else {
        return (
          <li>{ref.type}: {organization} {value}</li>
        );
      }
      }));
    }

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
        <dt>Expocode</dt><dd>{expocode_link}</dd>
        <dt>Data Owner/PI</dt><dd><ul className="list-unstyled">{hrp_owners}</ul></dd>
        <dt>Chief Scientist(s)</dt><dd><ul className="list-unstyled">{chi_scis}</ul></dd>
        <dt>Dates</dt><dd>{cruise.startDate}/{cruise.endDate}</dd>
        <dt>Port Out</dt><dd>{cruise.start_port}</dd>
        <dt>Port In</dt><dd>{cruise.end_port}</dd>
        <dt>Ship</dt><dd>{cruise.ship}</dd>
        <dt>Institutions</dt><dd><ul className="list-unstyled">{institutions}</ul></dd>
        <dt>References</dt><dd><ul className="list-unstyled">{references}</ul></dd>        
        </dl>
        <h4>Microstructure NetCDF Dataset</h4>
        <ul>
          {dataset}
        </ul>
        <h4>Reports</h4>
        <ul>
          {reports}
        </ul>


        {supplemental_files}

        
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
        <tr>
          <td key={program.cruise.expocode}><Link to={`/cruise/${program.cruise.expocode}`}>{program.cruise.sites["microstructure.ucsd.edu"].name}</Link>
          </td>
          <td key={program.cruise.start_port}>
            {program.cruise.start_port}
          </td>            
          <td key={program.cruise.startDate}>
            {program.cruise.startDate}
          </td>
          <td key={program.cruise.endDate}>
            {program.cruise.endDate}
          </td>
        </tr>
          )
    });

    return (
      <div>
        {/*
         <Breadcrumb>
           <Breadcrumb.Item active>
             Programs
           </Breadcrumb.Item>
         </Breadcrumb>
        */}

        <IntroPane />

        <h2>Microstructure Programs</h2>

        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Port Out</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {programs}
          </tbody>
        </table>

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
      <Microstructure source={api_url} expocode={expocode}/>
    )
  }
}

export default App;
