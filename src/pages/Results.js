import { MDBBtn, MDBIcon, MDBTextArea, MDBContainer, MDBDatatable, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBBtnGroup, MDBRow, MDBCol } from "mdb-react-ui-kit";
import { useState } from "react";


export default function Results({blasting, setBlasting}){

    const [loading, setLoading] = useState(false);

    return (
        <MDBModal show staticBackdrop>
            <MDBModalDialog size="xl">
                <MDBModalContent style={{backgroundColor: "#202020", color: "#fff"}}>
                    <MDBModalHeader>
                        <MDBModalTitle>
                        BLASTing...
                        </MDBModalTitle>
                        {!loading && <MDBBtn className="btn-close" color="white"/>}
                    </MDBModalHeader>
                    {loading ? <MDBModalBody>
                        <MDBIcon icon="rocket" size="10x"/>
                    </MDBModalBody>:
                    <MDBModalBody>
                        <h5>Your DNA Sequence</h5>
                        <textarea
                            id="query-textarea"
                            readOnly
                            value={document.getElementById("query-textarea").value}
                            style={{border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px"}}
                        />
                        <h5>BLASTn</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                        <MDBRow>
                            <MDBCol>
                                <h5>Protein Sequence</h5>
                            </MDBCol>
                            <MDBCol>
                                <MDBBtnGroup>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 1
                                    </MDBBtn>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 2
                                    </MDBBtn>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 3
                                    </MDBBtn>
                                </MDBBtnGroup>
                                <MDBBtn className="ms-5 pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                    Rerun Blast p
                                </MDBBtn>
                            </MDBCol>
                        </MDBRow>
                        <textarea
                            id="query-textarea"
                            readOnly
                            value="replace with protein seq"
                            style={{border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px"}}
                        />
                        <h5>BLASTx</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                        <h5>BLASTp</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                    </MDBModalBody>}
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    );
}