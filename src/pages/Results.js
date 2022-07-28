import { MDBBtn, MDBIcon, MDBTextArea, MDBContainer, MDBDatatable, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBBtnGroup, MDBRow, MDBCol, MDBSpinner, MDBCollapse } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import { useElapsedTime } from "use-elapsed-time";

function checkBlast({ id, setResult, aftermath }) {
    if (id == undefined) {
        return;
    }

    fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&RID=" + id)
        .then(data => data.text())
        .then(data => {
            const stats = data.match("QBlastInfoBegin(.|\n)*?(QBlastInfoEnd)")[0];
            console.log(stats);
            if (stats.includes("Status=READY")) {
                fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=XML&RID=" + id)
                    .then(data => data.text())
                    .then(data => {
                        const parser = new DOMParser();
                        data = parser.parseFromString(data, "text/xml");
                        data = data.getElementsByTagName("Hit");
                        setResult(Array.from(data));
                        if (aftermath != null) {
                            aftermath();
                        }
                        return;
                    }
                    );
            }
            else {
                if (stats.includes("Status=FAILED")){
                    setResult([]);
                    aftermath();
                    return;
                }
                setTimeout(() => checkBlast({ id, setResult, aftermath }), 30000);
            }
        });
}

function runBLAST({ db = "nt", program = "blastn", qSequence, setResult, next, aftermath, additionalParams="" }) {

    fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=" + program + "&DATABASE=" + db + "&QUERY=" + qSequence + "&CMD=Put" + additionalParams)
        .then(data => data.text())
        .then(data => {
            const [id, seconds] = data.match("QBlastInfoBegin(.|\n)*?(QBlastInfoEnd)")[0].split("\n").slice(1, -1).map(value => value.replace("RID = ", "").replace("RTOE = ", "").replace("\s/g", ""));
            console.log("id: " + id);
            checkBlast({id, setResult, aftermath})
        });

    if (next != null) {
        setTimeout(next, 30000);
    }
}

function BLASTTables({rows, blastSrc, cols = [
    "Accession #",
    "Description", 
    "E-Value", 
    "Start",
    "End",
    "Frame"
]}){

    if (blastSrc != null){
        rows = blastSrc.map(hit => {
            const HSP = hit.childNodes[11].childNodes[1];
            return [
                hit.childNodes[7].textContent,
                hit.childNodes[5].textContent, 
                HSP.childNodes[7].textContent.includes("e") ? (hit.childNodes[11].childNodes[1].childNodes[7].textContent.split(".")[0] + "." + hit.childNodes[11].childNodes[1].childNodes[7].textContent.split(".")[1][0] + "e-" + hit.childNodes[11].childNodes[1].childNodes[7].textContent.split("-")[1]) : hit.childNodes[11].childNodes[1].childNodes[7].textContent, 
                HSP.childNodes[9].textContent,
                HSP.childNodes[11].textContent,
                HSP.childNodes[17].textContent,
            ]}
        )
    }

    if (rows == null)
    {
        rows = [];
    }

    return (
        <MDBDatatable
            entries={10}
            search
            entriesOptions={[10]}
            data={{
                columns: cols,
                rows: rows
            }}
            style={{ backgroundColor: "#202020", color: "#fff" }}
            dark
            searchInputProps={{contrast: true}}
            noFoundMessage="No Results Found. Try indexing to the first page if you are searching else BLAST may have failed or there are acutally no results."
        />
    );
}

function runPDB({qSequence, setResult, next, aftermath}){

    console.log("query: " + qSequence);

    if (qSequence == null){
        return;
    }

    setResult("https://www.rcsb.org/search?request="+`%7B"query"%3A%7B"type"%3A"group"%2C"logical_operator"%3A"and"%2C"nodes"%3A%5B%7B"type"%3A"terminal"%2C"service"%3A"sequence"%2C"parameters"%3A%7B"evalue_cutoff"%3A0.1%2C"identity_cutoff"%3A0%2C"target"%3A"pdb_protein_sequence"%2C"value"%3A"` + qSequence + `"%7D%7D%5D%7D%2C"return_type"%3A"polymer_entity"%7D`);

    if (next != null) {
        setTimeout(next, 5000);
    }

    if (aftermath != null) {
        setTimeout(aftermath, 5000);
    }
}

export default function Results({ closeBtn }) {

    const DNASequence = document.getElementById("query-textarea-dna").value;
    const ProteinSequence = document.getElementById("query-textarea-protein").value;
    
    const [loading, setLoading] = useState(true); //blastn_nrnt == null || blastn_est == null || blastx_nrnt == null //|| blastp_nrnt == null;

    const { elapsedTime } = useElapsedTime({ isPlaying: loading, updateInterval: 1});

    const getTimeFormatted = () => {
        return (new Date(Number(String(elapsedTime).split(".")[0]) * 1000)).toISOString().slice(14, 19);
    }

    const [openLoadLog, setOpenLoadLog] = useState(false);
    const [loadLog, setLoadLog] = useState(["----------Initiated Search----------"]);

    const [openDNA, setOpenDNA] = useState(true);
    const [openProtein, setOpenProtein] = useState(true);
    const [openedN_nrnt, setOpenedN_nrnt] = useState(true);
    const [openedN_est, setOpenedN_est] = useState(true);
    const [openedX_nrnt, setOpenedX_nrnt] = useState(true);
    const [openedP_nrnt, setOpenedP_nrnt] = useState(true);
    const [openedP_homoSapiens, setOpenedP_homoSapiens] = useState(true);
    const [openedPDB, setOpenedPDB] = useState(true);
    const [openedn_tsa, setOpenedn_tsa] = useState(true);
    const [openedTAIR, setOpenedTAIR] = useState(true);
    const [openedLocus, setOpenedLocus] = useState(true);

    const [blastn_nrnt, setBlastn_nrnt] = useState(null);
    const [blastn_est, setBlastn_est] = useState(null);
    const [blastx_nrnt, setBlastx_nrnt] = useState(null);
    const [blastp_nrnt, setBlastp_nrnt] = useState(null);
    const [blastp_homoSapiens, setBlastp_homoSapiens] = useState(null);
    const [PDBLink, setPDBLink] = useState(null);
    const [locus, setLocus] = useState(null);
    const [bioGRIDID, setBioGRIDID] = useState(null);

    const setMessageDone = (program) => {
        setLoadLog(loadLog => [...loadLog, "     " + new Date(Date.now()) + "-" + program + " - Done"]);
    }

    //initialize the searches
    useEffect(() => {

        const blastN_NRNT = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated BlastN-NRNT"]);
            runBLAST({db: "nt", program: "blastn", qSequence: DNASequence, setResult: setBlastn_nrnt, additionalParams: "&FILTER=T", next: blastN_EST, aftermath: () => setMessageDone("BlastN-NRNT")});
        }

        const blastN_EST = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated BlastN-EST"]);
            runBLAST({db: "est", program: "blastn", qSequence: DNASequence, setResult: setBlastn_est, additionalParams: "&FILTER=T", next: blastX, aftermath: () => setMessageDone("BlastN-EST")});
        }

        const blastX = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated BlastX"]);
            runBLAST({db: "nr", program: "blastx", qSequence: DNASequence, setResult: setBlastx_nrnt, additionalParams: "&FILTER=F", next: blastP, aftermath: () => setMessageDone("BlastX")});
        }

        const blastP = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated BlastP"]);
            runBLAST({db: "nr", program: "blastp", qSequence: ProteinSequence, setResult: setBlastp_nrnt, additionalParams: "&FILTER=F", next: blastP_homoSapiens, aftermath: () => setMessageDone("BlastP")});
        }

        const blastP_homoSapiens = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated BlastP - Homo sapiens"]);
            runBLAST({db: "nr", program: "blastp", qSequence: ProteinSequence, setResult: setBlastp_homoSapiens, additionalParams: "&FILTER=F&EQ_MENU=Home%20sapiens%20%28taxid%3A9606%29", next: searchPDB, aftermath: () => setMessageDone("BlastP-Homo Sapiens")});
        }

        const searchPDB = () => {
            setLoadLog(loadLog => [...loadLog, new Date(Date.now()) +" - Initiated PDB"]);
            runPDB({qSequence: ProteinSequence, setResult: setPDBLink, aftermath: () => setMessageDone("PDB")});
        }

        blastN_NRNT();
    }, [])

    //check for updates on status
    useEffect(() => {

        if (blastn_nrnt == null || blastn_est == null || blastx_nrnt == null || blastp_nrnt == null || blastp_homoSapiens == null || PDBLink == null) 
        {
            return;
        }

        setLoadLog(loadLog => [...loadLog, "----------All Done!----------"]);
        setLoading(false);
    }, [blastn_nrnt, blastn_est, blastx_nrnt, blastp_nrnt, blastp_homoSapiens, PDBLink])

    return (
        <MDBModal show staticBackdrop>
            <MDBModalDialog size="xl" style={{color: "#000"}}>
                <MDBModalContent style={{ backgroundColor: "#202020", color: "#fff" }}>
                    <MDBModalBody>
                        <MDBContainer className="d-flex">
                            <MDBModalTitle style={{color: "#6a65fc"}} className="me-0 ms-0">
                                {loading ? "BLASTing..." : "BLAST Results"}
                            </MDBModalTitle>
                            {!loading && <MDBBtn onClick={closeBtn} className="ms-auto ps-2 pt-1 pe-2 pb-1" color="white" style={{backgroundColor: "#6a65fc", width: "25px", height: "25px"}}><MDBIcon icon="times" className="ms-0 me-0 ps-0 pe-0"/></MDBBtn>}
                        </MDBContainer>
                    </MDBModalBody>
                    <MDBModalBody>
                    {loading ? <>
                        <center>
                            <MDBSpinner color="white" className="mb-4 mt-4" />
                            <p className="mb-0">{getTimeFormatted()} - It may take a while to run all the BLAST searches required.</p>
                            <p className="sub-p">Please leave this page open - it will automatically refresh when done</p>
                            <iframe className="pt-4" src={"https://slither.io"} width="90%" height="450px" />
                            <p className="sub-p">The game will disconnect when done.</p>
                        </center>
                    </> :
                        <>
                            <img src="./images/results/rocketPrimase.png" alt="rocket primase" width="100%" />
                            <MDBBtn onClick={() => setOpenDNA(!openDNA)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >DNA Sequence</MDBBtn>
                            <MDBCollapse show={openDNA}>
                                <h4 style={{color: "#6a65fc"}}>DNA Sequence</h4>
                                <textarea
                                    readOnly
                                    value={DNASequence}
                                    style={{ border: "0px solid black", backgroundColor: "#242424", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "300px" }}
                                />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedN_nrnt(!openedN_nrnt)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTn NRNT</MDBBtn>
                            <MDBCollapse show={openedN_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTn NRNT</h4>
                                <BLASTTables blastSrc={blastn_nrnt}/>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedN_est(!openedN_est)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTn EST</MDBBtn>
                            <MDBCollapse show={openedN_est}>
                                <h4 style={{color: "#6a65fc"}}>BLASTn EST</h4>
                                <BLASTTables blastSrc={blastn_est}/>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenProtein(!openProtein)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >Protein Sequence</MDBBtn>
                            <MDBCollapse show={openProtein}>
                                <MDBRow>
                                    <MDBCol>
                                        <h4 style={{color: "#6a65fc"}}>Protein Sequence</h4>
                                    </MDBCol>
                                </MDBRow>
                                <textarea
                                    readOnly
                                    value={ProteinSequence}
                                    style={{ border: "0px solid white", backgroundColor: "#242424", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "300px" }}
                                />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedX_nrnt(!openedX_nrnt)}
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTx NR</MDBBtn>
                            <MDBCollapse show={openedX_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTx NR</h4>
                                <BLASTTables blastSrc={blastx_nrnt} />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedP_nrnt(!openedP_nrnt)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTp NR</MDBBtn>
                            <MDBCollapse show={openedP_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTp NR</h4>
                                <BLASTTables blastSrc={blastp_nrnt} />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedP_homoSapiens(!openedP_homoSapiens)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTp Homo Sapiens</MDBBtn>
                            <MDBCollapse show={openedP_homoSapiens}>
                                <h4 style={{color: "#6a65fc"}}>BLASTp Homo Sapiens</h4>
                                <BLASTTables blastSrc={blastp_homoSapiens} />
                                {/* <MDBBtn 
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                                >Open BlastX Page</MDBBtn> */}
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedPDB(!openedPDB)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >RCSB Protein Matches</MDBBtn>
                            <MDBCollapse show={openedPDB}>
                            <h4 style={{color: "#6a65fc"}}>RCSB PDB Protein Matches</h4>
                                <iframe src={PDBLink} width="100%" height="700px" style={{borderRadius: "5px"}} />
                                <MDBBtn href={PDBLink}
                                    target="_blank"
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                ><MDBIcon icon="external-link-alt" className="me-2"/>Open RCSB In New Tab</MDBBtn>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedn_tsa(!openedn_tsa)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >Blastn TSA</MDBBtn>
                            <MDBCollapse show={openedn_tsa}>
                                <h4 style={{color: "#6a65fc"}}>Blastn TSA</h4>
                                <p style={{color: "#6a65fc"}}>We decided to not automate blastN TSA because you would still need to pick the contig to run a blastX with later. Click the button below to start a blastnTSA query with your DNA sequence prefilled.</p>
                                <MDBBtn href={"https://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&PAGE=Nucleotides&PROGRAM=blastn&QUERY="+DNASequence+"&JOB_TITLE=Nucleotide%20Sequence&GAPCOSTS=5%202&MATCH_SCORES=2,-3&DATABASE=tsa_nt&BLAST_PROGRAMS=blastn&MAX_NUM_SEQ=100&EXPECT=10&WORD_SIZE=11&REPEATS=566037&TEMPLATE_TYPE=0&TEMPLATE_LENGTH=0&FILTER=L&EQ_MENU=GAQZ%3A%20TSA%3A%20Landoltia%20punctata%2C%20transcriptome%20shotgun%20assembly&DB_GROUP=WGSProj&PROG_DEFAULTS=on&SHOW_OVERVIEW=false&SHOW_LINKOUT=false&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=false&NEW_VIEW=false&NCBI_GI=false&NUM_OVERVIEW=100&DESCRIPTIONS=100&ALIGNMENTS=50&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&SHOW_CDS_FEATURE=false"}
                                    target="_blank"
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                ><MDBIcon icon="external-link-alt" className="me-2"/>Run BLASTn TSA In New Tab</MDBBtn>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedTAIR(!openedTAIR)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >TAIR Database</MDBBtn>
                            <MDBCollapse show={openedTAIR}>
                                <h4 style={{color: "#6a65fc"}}>TAIR Database</h4>
                                <p style={{color: "#6a65fc"}}>!!!!!!Remember to change from blastN to blastP on blast program!!!!!!</p>
                                <iframe src="https://www.arabidopsis.org/Blast/index.jsp" width="100%" height="700px" style={{borderRadius: "5px"}} />
                                <MDBBtn href="https://www.arabidopsis.org/Blast/index.jsp"
                                    target="_blank"
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                ><MDBIcon icon="external-link-alt" className="me-2"/>Open TAIR In New Tab</MDBBtn>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedLocus(!openedLocus)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >Arabidopsis Homologs &amp; Cell Localization</MDBBtn>
                            <MDBCollapse show={openedLocus}>

                            <h4 style={{color: "#6a65fc"}}>Arabidopsis Homologs &amp; Cell Localization</h4>
                                <MDBRow>
                                    <MDBCol size="10">
                                        <textarea
                                            id="query-textarea-locus"
                                            placeholder="Enter locus (AT number) of homolog"
                                            style={{ border: "0px solid black", backgroundColor: "#2d2d2d", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", height: "35px" }}
                                        />
                                    </MDBCol>
                                    <MDBCol size="2" className="ms-0">
                                        <MDBBtn onClick={() => {
                                            const loc = document.getElementById("query-textarea-locus").value;

                                            if (loc.replace(" ", "") == "")
                                            {
                                                return;
                                            }

                                            setLocus(loc);
                                            setBioGRIDID(null);

                                            setOpenedLocus(false);
                                            setTimeout(() => {setOpenedLocus(true)}, 500);

                                            fetch("https://webservice.thebiogrid.org/interactions?geneList="+loc+"&accesskey=9df8e32b4195b14e33658dcb6762f60a&format=json")
                                                .then(res => res.json())
                                                .then(data => {
                                                    const m = new Map(Object.entries(data));
                                                    setBioGRIDID(m.get(m.keys().next().value)["BIOGRID_ID_B"]);
                                                })
                                        }}
                                            color="link"
                                            style={{color: "#39C0ED", backgroundColor: "#2d2d2d", width: "100%", height: "35px"}}
                                        >Search!</MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            <MDBCollapse show={locus != null && bioGRIDID != null}>
                                <MDBBtn href={"https://thebiogrid.org/"+bioGRIDID+"/summary/arabidopsis-thaliana/pag1.html"}
                                    target="_blank"
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                ><MDBIcon icon="external-link-alt" className="me-2"/>Open BioGRID in new tab</MDBBtn>
                                {/* <iframe src={"http://bar.utoronto.ca/efp/cgi-bin/efpWeb.cgi?primaryGene="+locus+"&mode=Absolute&dataSource=Developmental_Map"} width="100%" height="700px" style={{borderRadius: "5px"}} /> */}
                                <MDBBtn href={"http://bar.utoronto.ca/efp/cgi-bin/efpWeb.cgi?primaryGene="+locus+"&mode=Absolute&dataSource=Developmental_Map"}
                                    target="_blank"
                                    color="link"
                                    className="mt-1 mb-1"
                                    style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                ><MDBIcon icon="external-link-alt" className="me-2"/>Open Arabidopsis Homolog In New Tab</MDBBtn>

                                {/* <iframe src={"http://bar.utoronto.ca/cell_efp/cgi-bin/cell_efp.cgi?primaryGene="+locus} width="100%" height="700px" style={{borderRadius: "5px"}} /> */}
                                <MDBBtn href={"http://bar.utoronto.ca/cell_efp/cgi-bin/cell_efp.cgi?primaryGene="+locus}
                                        target="_blank"
                                        color="link"
                                        className="mt-1 mb-1"
                                        style={{color: "#39C0ED", backgroundColor: "#242424", width: "100%"}}
                                    ><MDBIcon icon="external-link-alt" className="me-2"/>Open Cell Localization In New Tab</MDBBtn>
                                </MDBCollapse>
                            </MDBCollapse>
                        </>}
                        <center>
                            <MDBBtn onClick={() => setOpenLoadLog(!openLoadLog)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >Log</MDBBtn>
                            <MDBCollapse show={openLoadLog}>
                            <textarea
                                readOnly
                                value={loadLog.map(v => v + "\n").join("")}
                                style={{ border: "0px solid black", backgroundColor: "#242424", color: "#6a65fc", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "300px" }}
                            />
                            </MDBCollapse>
                        </center>
                    </MDBModalBody>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    );
}