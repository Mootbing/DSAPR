import React from 'react';
import { useState } from 'react';
import { MDBBtn, MDBCol, MDBContainer, MDBCollapse, MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBDropdownLink, MDBRadio, MDBRow, MDBTextArea, MDBSwitch, MDBNavbar, MDBNavbarNav, MDBNavbarItem, MDBNavbarLink, MDBNavbarBrand, MDBSpinner } from 'mdb-react-ui-kit';

function App() {

  const [blasting, setBlasting] = useState(false);

  const [removeUnnamed, setRemoveUnnamed] = useState(true);

  return (
    <div style={{backgroundColor: "#181818", width: "100%", height: "100%"}}>
      <MDBNavbar expand="md">
        <MDBNavbarBrand href="" className="ms-3" style={{color: "#737373"}}>
          DNA
          {/* <img src="https://wssp.rutgers.edu/sites/wssp.rutgers.edu/themes/wssp/logo.png"
          width="40px" height="auto" /> */}
        </MDBNavbarBrand>
        <MDBCollapse navbar show>
          <MDBNavbarNav>
            <MDBNavbarItem>
              <MDBNavbarLink href="http://benzer.rutgers.edu/DSAP/Projects/DSAP22" target="_blank" style={{color: "#737373"}} className="ps-5"><u>Open DSAP</u></MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink href="https://wssp.rutgers.edu/resources" target="_blank" style={{color: "#737373"}} className="ps-5"><u>To WSSP</u></MDBNavbarLink>
            </MDBNavbarItem>
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBNavbar>
      <MDBContainer>
        <center>
          <img src="./images/home/DSAPR.png" className="DSAP-Image" />
        </center>
        <MDBContainer className="query margin-left-right">
          <MDBRow>
            <textarea
              placeholder="Cropped sequences (eg: AGGAACGCTTAGGACCACC)" 
              style={{border: "0px solid black", backgroundColor: "#1F1F1F", color: "#fff", borderRadius: "3px", minHeight: "100px"}}
            />
          </MDBRow>
          <center>
          <MDBRow className="pt-2">
            <MDBCol>
              <MDBBtn onClick={() => setRemoveUnnamed(!removeUnnamed)} color="color-secondary shadow-0 pb-1 pt-1 mt-1 mb-0 ps-2 pe-5" style={{backgroundColor: "#1F1F1F"}}>
                {
                  !removeUnnamed ? 
                  <MDBIcon icon="check-circle" size="lg" className="me-2 pe-3"/>:
                  <MDBIcon icon="times-circle" size="lg" className="me-2 pe-3"/>
                }
                {!removeUnnamed ? "Keep Unnamed Clones": "Remove Unnamed Clones"}
              </MDBBtn>
            </MDBCol>
            <MDBCol>
              <div className="color-background">
                <MDBBtn className='pt-1 mb-0 ms-2 pb-1' disabled style={{backgroundColor: "#1F1F1F", color: "#737373"}}>
                  Query 10 Results
                </MDBBtn>
                <MDBDropdown group className='shadow-0 color-primary' style={{backgroundColor: "#303030"}}>
                  <MDBDropdownToggle className="ps-2 pe-2 pt-1 pb-1" color='color-secondary' />
                  <MDBDropdownMenu dark color='color-primary'>
                    <MDBDropdownItem>
                      <MDBDropdownLink href="#">Action</MDBDropdownLink>
                    </MDBDropdownItem>
                    <MDBDropdownItem>
                      <MDBDropdownLink href="#">Another action</MDBDropdownLink>
                    </MDBDropdownItem>
                    <MDBDropdownItem>
                      <MDBDropdownLink href="#">Something else here</MDBDropdownLink>
                    </MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              </div>
            </MDBCol>
          </MDBRow>
          <MDBRow className="pt-2">
            <MDBBtn onClick={() => setBlasting(true)} disabled={blasting} className="pt-2 mb-0 ms-2 pb-1 shadow-0" color="color-primary" style={{backgroundColor: "#1f1f1f"}}>
              {!blasting? 
                <MDBIcon icon="rocket" className="me-2"/>:
                <MDBSpinner size="sm" className="me-2"/>
              }
              BLAST-OFF
            </MDBBtn>
          </MDBRow>
          <p style={{fontSize: "11px"}} className="pb-0 mb-0">BLASToff is not an official blast, nor should you use it in place of your research. It is meant as a tool for checking TheSAP.</p>
          <i style={{fontSize: "11px"}} className="mb-5 pt-0 mt-0">"If we have the tech to make big metal tube go space we can simplify TheSAP"---Together, we BLASToff into the future.</i>
          </center>
        </MDBContainer>
      </MDBContainer>
    </div>
  );
}

export default App;
