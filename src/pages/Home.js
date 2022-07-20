import React from 'react';
import { useState } from 'react';
import { MDBBtn, MDBAlert, MDBCol, MDBContainer, MDBCollapse, MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBDropdownLink, MDBRadio, MDBRow, MDBTextArea, MDBSwitch, MDBNavbar, MDBNavbarNav, MDBNavbarItem, MDBNavbarLink, MDBNavbarBrand, MDBSpinner, MDBFooter } from 'mdb-react-ui-kit';
import Results from './Results';

export default function Home({}) {

  //blast
  const [blasting, setBlasting] = useState(false);


  const [removeUnnamed, setRemoveUnnamed] = useState(true);

  const [dnaBad, setDnaBad] = useState(false);

  const [proteinFrame, setProteinFrame] = useState("Frame 1");
  const [queryNumber, setQueryNumber] = useState("Get Top 5 Results");

  const [message, setMessage] = useState("");

  const BLAST = () => {
    const text = document.getElementById("query-textarea").value;

    console.log(text)

    if (text == null || text.replace(" ", "") == ""){
      setMessage("Please Input DNA");
      setDnaBad(true);
      return;
    }

    for (var char of text)
    {
      if (!["a", "t", "g", "c"].includes(char.toLowerCase()))
      {
        setMessage("DNA is not valid. Remember to process Ns.");
        setDnaBad(true);
        return;
      }
    }

    setMessage("");
    setDnaBad(false);
    setBlasting(true);
  }

  return (
    <div style={{backgroundColor: "#181818", width: "100%", height: "100%"}}>
      {blasting && <Results closeBtn={() => setBlasting(false)}/>}
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
            <MDBNavbarItem>
              <MDBNavbarLink href="https://wssp.rutgers.edu/resources/toolboxApp" target="_blank" style={{color: "#737373"}} className="ps-5"><u>To Toolbox</u></MDBNavbarLink>
            </MDBNavbarItem>
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBNavbar>
      <MDBContainer>
        <MDBAlert
          show={dnaBad}
          position="top-right"
          color='danger'
          width={200}
        >
          <center>
            {message}
          </center>
        </MDBAlert>
        <center>
          <img src="./DSAPR/images/home/DSAPR.png" alt="Gel image" className="DSAP-Image" />
        </center>
        <MDBContainer className="query margin-left-right">
          <MDBRow>
            <textarea
              id="query-textarea"
              placeholder="Cropped sequences (eg: AGGAACGCTTAGGACCACC)" 
              style={{border: !dnaBad ? "0px solid black": "2px solid #FF8A8A", backgroundColor: "#1F1F1F", color: "#fff", borderRadius: "3px", minHeight: "100px"}}
            />
          </MDBRow>
          <center>
          <MDBRow className="pt-2">
            <MDBCol>
              <MDBBtn onClick={() => setRemoveUnnamed(!removeUnnamed)} color="color-secondary shadow-0 pb-1 pt-1 mt-1 mb-0 ps-2 pe-5" style={{backgroundColor: removeUnnamed ? "#737373" : "#1F1F1F"}}>
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
                  {queryNumber}
                </MDBBtn>
                <MDBDropdown group dropup className='shadow-0 color-primary' style={{backgroundColor: "#303030"}}>
                  <MDBDropdownToggle className="ps-2 pe-2 pt-1 pb-1" color='color-secondary' />
                  <MDBDropdownMenu dark color='color-primary'>
                    <MDBDropdownItem>
                      <MDBDropdownLink onClick={() => {setQueryNumber("Get Top 5 Results")}}>Get Top 5 Results</MDBDropdownLink>
                    </MDBDropdownItem>
                    <MDBDropdownItem>
                      <MDBDropdownLink onClick={() => {setQueryNumber("Get Top 10 Results")}}>Get Top 10 Results</MDBDropdownLink>
                    </MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              </div>
            </MDBCol>
            <MDBCol>
              <div className="color-background">
                <MDBBtn className='pt-1 mb-0 ms-2 pb-1' disabled style={{backgroundColor: "#1F1F1F", color: "#737373"}}>
                  {proteinFrame}
                </MDBBtn>
                <MDBDropdown group dropup className='shadow-0 color-primary' style={{backgroundColor: "#303030"}}>
                  <MDBDropdownToggle className="ps-2 pe-2 pt-1 pb-1" color='color-secondary' />
                  <MDBDropdownMenu dark color='color-primary'>
                    <MDBDropdownItem>
                      <MDBDropdownLink onClick={() => {setProteinFrame("Frame 1")}}>Frame 1</MDBDropdownLink>
                    </MDBDropdownItem>
                    <MDBDropdownItem>
                      <MDBDropdownLink onClick={() => {setProteinFrame("Frame 2")}}>Frame 2</MDBDropdownLink>
                    </MDBDropdownItem>
                    <MDBDropdownItem>
                      <MDBDropdownLink onClick={() => {setProteinFrame("Frame 3")}}>Frame 3</MDBDropdownLink>
                    </MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              </div>
            </MDBCol>
          </MDBRow>
          <MDBRow className="pt-2">
            <MDBBtn onClick={() => BLAST()} disabled={blasting} className="pt-2 mb-0 ms-2 pb-1 shadow-0" color="color-primary" style={{backgroundColor: "#1f1f1f"}}>
              {!blasting? 
                <MDBIcon icon="rocket" className="me-2"/>:
                <MDBSpinner size="sm" className="me-2"/>
              }
              BLAST-OFF
            </MDBBtn>
          </MDBRow>
          <p className="pb-0 mb-0 sub-p">BLASToff is not an official blast, nor should you use it in place of your research. It is meant as a tool for checking TheSAP.</p>
          <i className="mb-5 pt-0 mt-0 sub-p">"If we have the tech to make big metal tube go space we can simplify TheSAP"---Together, we BLASToff into the future.</i>
          </center>
        </MDBContainer>
      </MDBContainer>

      <MDBFooter>
        <MDBRow>
          <MDBCol>
            <MDBNavbarLink href="https://github.com/Mootbing/DSAPR" target="_blank" style={{color: "#737373"}} className="ps-5 d-flex"><u>To GitHub</u></MDBNavbarLink>
          </MDBCol>
          {/* <MDBCol>
            <MDBNavbarLink href="https://github.com/Mootbing/DSAPR" target="_blank" style={{color: "#737373"}} className="ps-5 d-flex"><u>To GitHub</u></MDBNavbarLink>
          </MDBCol> */}
        </MDBRow>
      </MDBFooter>
    </div>
  );
}
