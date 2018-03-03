// Global variables

// gaoQ = array of question objects defined and built in TEAmcq-q.js
// gaoA = array of answer objects defined and built in TEAmcq-a.js

var gnQnum; // number of questions already presented during current session
var gnQtop; // number of questions matching selected topics
var gnAused; // number of answers already used for current question
var gsAused; // answers used for current question as text separated by '...'
var gnAyy; // number of correct answers available
var gnAnn; // number of incorrect answers available

var gnQsolved; // number of questions that were answered correctly during current session
var gnAgood; // current question: correct answer for A or K (0=A to 4=E), number of correct answers Kprim (0-4)
var gbQnew; // current question still new and unanswered
var gbQisa; // current question is A-type
var gbQisp; // current question is prim (only relevant for K-type)

var gabAgood = new Array(4); // correct answer combination to current Kprim question
var gabAchoo = new Array(4); // choosen answer combination to current Kprim question

var gQiscal=0.74666667; // question image scale 560/750

var gbDs=0; // debug solutions
var gbDu=0; // debug usage count

var gbAtype=0; // use A-type questions
var gbKtype=0; // use K-type questions
var gbKprim=0; // use Kprim-type questions
   
// Count answers qualifying for the question with ID sQid.
// The function updates the global variables gnAyy (correct answers) and gnAnn (incorrect answers)
function Acount (sQid)
   {
   // local variables
   var bVyy; // current answer object already has version qualifying as correct
   var bVnn; // current answer object already has version qualifying as wrong
   
   // default result
   gnAyy=0;
   gnAnn=0;
   
   // Loop through answer objects
   for (i=0; i<gaoA.length; i++)
      {
	  // Process question only if inclusion probability not 0
	  if (gaoA[i].p>0)
	     {
	     // Loop through versions. If at least one version qualifying as correct or incorret
		 // is found, the corresponding counters are incremented. 
		 bVyy=false;
		 bVnn=false;
		 for (j=0; j<gaoA[i].tx.length; j++)
	        {
			// Look for versions qualifying as correct only until the first one has been found
			if(gaoA[i].qy[j].indexOf(sQid)>-1 && bVyy==false)
			   {
			   gnAyy+=1;
			   bVyy=true;
			   if (bVnn==true) break; // done with this object if a version qualifying as wrong has also been found
			   }
			// Look for versions qualifying as wrong only until the first one has been found
	        else if(gaoA[i].qn[j].indexOf(sQid)>-1 && bVnn==false)
			   {
	           gnAnn+=1;
			   bVnn=true;
			   if (bVyy=true) break; // done with this object if a version qualifying as correct has also been found
			   }
		    }
		 }
	  }
   }

// Returns a correct (if bGood=true) or incorrect (if bGood=false) answer text for the question with ID sQid.
// The function scans the array of answer objects until it finds the first object that contains at least one
// qualifying answer version. Of the least recently used qualifying versions in the object one is selected at
// random and returned. The used object is moved to the end of the array to minimize the probability of re-using it.
// Uses global string gsAused to make sure that same answer text does not appear twice in the same question.
function Aget (sQid,bGood)
   {
   // local variables
   var unMin; // smallest usage count
   var sResult=''; // answer text to be returned
   var aVer=[]; // array of matching versions in selected object
   
   // Default results
   if (bGood==true)
      sResult='RICHTIGE Antwort';
   else
      sResult='FALSCHE Antwort';
   
   // Loop trough answer objects to find first object that contains at least
   // one qualifying answer. Search ends at gaoA.length-gnAused in order to exclude
   // answers that have already been used for the current question.
   for (i=0; i<gaoA.length-gnAused; i++)
      {
	  // Process object only if inclusion probability not 0
	  aVer.length=0;
	  unMin=1000000;
	  if (gaoA[i].p>0)
	     {
         // Within answer object loop through all versions, building a
	     // list of all qualifying versions in aVer
	     for (j=0; j<gaoA[i].tx.length; j++)
	        {
	        // Answer text must not be 'x' (used to mask text of answers that may
			// appear in the next exam), answer text must not be contained in 
			// string of used answer texts and question ID sQid must be contained
			// either in qy field or qn field
			if (gaoA[i].tx[j]!='x' && gsAused.indexOf(gaoA[i].tx[j]+'...')<0)
			   {
			   if(bGood==true && gaoA[i].qy[j].indexOf(sQid)>-1)
			      {
	              aVer[aVer.length]=j;
				  if (gaoA[i].un[j]<unMin) unMin=gaoA[i].un[j];
				  }
	           else if(bGood==false && gaoA[i].qn[j].indexOf(sQid)>-1)
			      {
	              aVer[aVer.length]=j;
				  if (gaoA[i].un[j]<unMin) unMin=gaoA[i].un[j];
				  }
			   }
		    }
		 }

      // If at least one qualifying version has been found,
	  // select one of the least recently used ones at random, retrieve the answer text 
	  // and move the object to the end of the array to make sure
	  // it is not used again for the same question.
	  if (aVer.length>0)
	     {
		 // Reduce list of qualifying answers to most recently used ones
	     aVer.length=0;
		 for (j=0; j<gaoA[i].tx.length; j++)
	        {
	        // Answer text must not be 'x' (used to mask text of answers that may
			// appear in the next exam) and question ID sQid must be contained
			// either in qy field or qn field
			if (gaoA[i].tx[j]!='x' && gsAused.indexOf(gaoA[i].tx[j]+'...')<0)
			   {
			   if(bGood==true && gaoA[i].qy[j].indexOf(sQid)>-1 && gaoA[i].un[j]==unMin)
	              aVer[aVer.length]=j;
	           else if(bGood==false && gaoA[i].qn[j].indexOf(sQid)>-1 && gaoA[i].un[j]==unMin)
	              aVer[aVer.length]=j;
			   }
		    }
			 
		 // Retrieve answer text
		 j=Math.round((aVer.length)*Math.random()-0.5)
		 gaoA[i].un[aVer[j]]=1+gaoA[i].un[aVer[j]] // increment usage count of anwer
		 gsAused=gsAused+gaoA[i].tx[aVer[j]]+'...' // add to global used answers string
		 if (gbDu>0)
	        sResult='('+gaoA[i].un[aVer[j]]+') '+gaoA[i].tx[aVer[j]];
         else	
	        sResult=gaoA[i].tx[aVer[j]];
			
		 // Add label positions as prefix	
		 if (gaoA[i].xy[0]!='x')
		    sResult=gaoA[i].xy[aVer[j]]+' :: '+sResult;
         
		 // Move object to end
		 gaoA.splice(gaoA.length,0,gaoA[i]);
	     // gaoA[gaoA.length]=gaoA[i];
		 gaoA.splice(i,1);
		 gnAused+=1;
		 break;
		 }
	  }
   return sResult;
   }
   
// Intialize answers: called before beginning to retrieve answers for a question
function Ainit (bScramble)
   {
   // local variables
   var nAex=0; // number of excluded answers
	   
   // Entire array can be searched
   gnAused=0;
   
   // As an option order of objects can be freshly randomized
   if (bScramble==true)
      {
	  for (i=0; i<gaoA.length; i++)
         {
		 // Depending on its inclusion probability setting copy first object
		 // of array to end of array or to random location within array
		 // and then delete original
		 if (Math.random()<(0.000001+gaoA[0].p))
		    {
			gaoA.splice(gaoA.length-1-i+Math.round((i-nAex)*Math.random()+0.5),0,gaoA[0]);
			gaoA.splice(0,1);
			}
		 else	
		    {
			gaoA.splice(gaoA.length,0,gaoA[0]);
			gaoA.splice(0,1);
			++nAex;
			}
	     }
	  }
   }

// Provide visual feedback to user after an answer had been selected
// and update statistics of % questions correct. Called whenever user
// checks a radio button
function Qcheck (nAsel)
   {
   if (gbQnew==true) // process only user's 1st click on new question 
      {
      gbQnew=false;	  
      if (nAsel==gnAgood) // correct answer selected
         {
         eval ('document.images["img' + nAsel + '"].src = "right.gif"' ); // place icon correct next to selected answer
	     gnQsolved=gnQsolved+1; 
	     }
      else  // wrong answer selected: 	  
         {
         eval ('document.images["img' + gnAgood + '"].src = "right.gif"' ); // place icon correct next to correct answer 
         eval ('document.images["img' + nAsel + '"].src = "false.gif"' ); // place icon wrong next to checked answer
	     }
	  }
   }

// Provide feedback for Kprim question
function Qcprim (nAsel,nVal)
   {
	   
   // Local variables	   
   var nSelyy=0 // correct selections	
   var nSel=0 // selections   
	   
   if (gbQnew)
      {
      gabAchoo[nAsel]=nVal; // record answer
      for (i=0; i<4; i++)
         {
	     if (gabAchoo[i]==gabAgood[i]) {nSelyy+=1;}
	     if (gabAchoo[i]>-1) {nSel+=1;}  
	     }
	  }
	  
   if (nSel>3)
      {
	  gbQnew=false;	  
	  if (nSelyy==4) {gnQsolved=gnQsolved+1;}
	  if (nSelyy==3) {gnQsolved=gnQsolved+0.5;}
	  for (i=0; i<4; i++)
         {
    	 if (gabAchoo[i]==gabAgood[i])
	        {
		    eval ('document.images["img' + i + '"].src = "right.gif"');
		    }
	     else	  
	        {
		    eval ('document.images["img' + i + '"].src = "false.gif"');
		    }
		 }
	  }
   }

// Initialize question engine
// Called wheever a new question session starts
function Qinit ()
   {
   gnQnum=0; // initialize question counter
   gnQsolved=0; // initialize counter of solved questions
   gbQisa=0; // start with A-type question if possible
   
   // Select qualifying question objects for each of the checked topics
   // and determine total mubmer of qualifying questions
   gnQtop=0;
   // Anatomie I+II Grundlagen
   if ( document.forms["Selector"].ApAg.checked ) {Topicsel ('ApwAg')};
   if ( document.forms["Selector"].ApEm.checked ) {Topicsel ('ApwEm')};
   if ( document.forms["Selector"].ApBh.checked ) {Topicsel ('ApsBh')};
   if ( document.forms["Selector"].ApNi.checked ) {Topicsel ('ApsNi')};
   if ( document.forms["Selector"].ApVt.checked ) {Topicsel ('ApsVt')};
   if ( document.forms["Selector"].ApRs.checked ) {Topicsel ('ApwRs')};
   if ( document.forms["Selector"].ApHa.checked ) {Topicsel ('ApsHa')};
   if ( document.forms["Selector"].ApEk.checked ) {Topicsel ('ApsEk')};
   if ( document.forms["Selector"].ApBz.checked ) {Topicsel ('ApsBz')};
   if ( document.forms["Selector"].ApNa.checked ) {Topicsel ('ApwNa')};
   if ( document.forms["Selector"].ApSi.checked ) {Topicsel ('ApsSi')};
   if ( document.forms["Selector"].ApRp.checked ) {Topicsel ('ApsRp')};
   if ( document.forms["Selector"].HqA.checked ) {Topicsel ('HqA')};
   if ( document.forms["Selector"].HqS.checked ) {Topicsel ('HqS')};
   // Anatomie I+II Vertiefung
   if ( document.forms["Selector"].AvNa.checked ) {Topicsel ('AvwNa')};
   // Funktionelle Anatomie
   if ( document.forms["Selector"].FaAg.checked ) {Topicsel ('FaAg')};
   if ( document.forms["Selector"].FaUe.checked ) {Topicsel ('FaUe')};
   if ( document.forms["Selector"].FaRu.checked ) {Topicsel ('FaRu')};
   if ( document.forms["Selector"].FaOe.checked ) {Topicsel ('FaOe')};
   // Nervensystem
   if ( document.forms["Selector"].UnGr.checked ) {Topicsel ('UnwGr')};
   if ( document.forms["Selector"].UnRm.checked ) {Topicsel ('UnwRm')};
   if ( document.forms["Selector"].UnHs.checked ) {Topicsel ('UnwHs')};
   
   // Determine selceted question types
   gbAtype=0
   gbKtype=0
   gbKprim=0
   if ( document.forms["Qtype"].Atype.checked ) {gbAtype=1};
   if ( document.forms["Qtype"].Ktype.checked ) {gbKtype=1};
   if ( document.forms["Qtype"].Kprim.checked ) {gbKprim=1};
   if(gbKprim==0){gbQisp=0} // Any K question will be prim
   }

// Stop question engine
// Called whenever the user clicks the [Stop] button
function Qstop ()
   {
   document.getElementById('Qinterface').innerHTML = ""; // clear question area
   document.location="TEAmcq-ge.htm#T"; // scroll up to document navigation
   }

// Build and display next question
// Called whenever a session starts or the user presses the [Next] button
function Qnext ()
   {
   // Local variables
   var nAyymax; // max possible correct for Kprim question
   var nAyymin; // min possible correct for Kprim question
   var nVer; // version selected of current question
   var bCls; // collision has occurred
   var bPos; // answers for current question are position dependent
   var sQid = ''; // ID of current question
   var sTape = ''; // question to be displayed as HTML code
   var sAbcde = 'ABCDE'; // to extract answer labels
   var sKaaaa; // possible answer combinations ABCDE
   var asKcomb = new Array('1+2+3','1+3','2+4','4','alle (1+2+3+4)'); // standard text elements
   var sQtext; // text of current question
   var sImg; // path to image file for current question
   var sQxyok; // text buffer to collect labels that passed collision test
   var sQxytest; // currently tested label
   var sQlbttest; // type of currently tested label (LRTBC)
   var Qlbxtest; // x position of currently tested label as integer
   var Qlbytest; // y position of currently tested label as integer
   var asQanswers = new Array(5); // answers to current question as array of 5 strings
   var asQxy = new Array(4); // label position strings in the form "R234354 L120023 C458374"
   var aQlbx = new Array(4); // label x position as integer
   var aQlby = new Array(4); // label y position as integer
   var asQlbt = new Array(4); // label type as text
   var ai = new Array(4); // array of indices into answer arrays
   var aVer=[]; // array of matching versions in selected object

   // Scroll browser window to question area
   document.location="TEAmcq-ge.htm#Q"; 

   // Display error message if no questions available
   if (gnQtop==0)
      {
	  sTape  = 'Die Fragen zur getroffenen Themenauswahl werden gerade überarbeitet';
      sTape += '<br>';
	  sTape += 'und im Lauf des Semesters wieder aufgeschaltet.';
      sTape += '<br>';
      sTape += '<br>';
      sTape += ' [ <a href="javascript: Qstop()";"> Themenauswahl korrigieren </a> ]';
	  document.getElementById('Qinterface').innerHTML = sTape;
	  document.getElementById('Qimg').innerHTML = '';
	  document.getElementById('Qlb1').innerHTML = '';
	  document.getElementById('Qlb2').innerHTML = '';	 
	  document.getElementById('Qlb3').innerHTML = '';	 
	  document.getElementById('Qlb4').innerHTML = '';	 
	  return;
	  }
   
   // Display error message if no question types selected
   if (gbAtype+gbKtype+gbKprim==0)
      {
	  sTape  = 'Es sind keine Fragetypen ausgewählt worden.';
      sTape += '<br>';
      sTape += '<br>';
      sTape += ' [ <a href="javascript: Qstop()";"> Fragetypenauswahl korrigieren </a> ]';
	  document.getElementById('Qinterface').innerHTML = sTape;
	  document.getElementById('Qimg').innerHTML = '';
	  document.getElementById('Qlb1').innerHTML = '';
	  document.getElementById('Qlb2').innerHTML = '';	 
	  document.getElementById('Qlb3').innerHTML = '';	 
	  document.getElementById('Qlb4').innerHTML = '';	 
	  return;
	  // Note: topic selection overrides question type selection
	  // Questions of a selected topic will be presented even if they are only
	  // available in types not selected by the user
	  }
   
   // Initialize array of answer objects, scramble order whenever all
   // available questions have been used
   if ((gnQnum%gnQtop) >0)
      Ainit (false);
   else
      Ainit (true);
   gnQnum+=1;
   gbQnew=true; // flag indicating that user has not yet responded to current question
   gabAchoo[0]=-1;
   gabAchoo[1]=-1;
   gabAchoo[2]=-1;
   gabAchoo[3]=-1;
   
   // Build list of question versions whose question text is not "x"
   // (used to mask question versions that may be used in the next exam)
   aVer.length=0;
   for (j=0; j<gaoQ[0].at.length; j++)
      {
      if (gaoQ[0].at[j]!='x') aVer[aVer.length]=j;	 
      }

   // From the list of qualifying question versions select one at random
   // or set version =0 if there are no qualifying versions
   nVer=0;
   if (aVer.length>0) 
      {
      j=Math.round((aVer.length)*Math.random()-0.5);
	  nVer=aVer[j];
	  }

   // Determine if question is going to be A or K-type and set question text accordingly.
   // There should be as much alternation as possible.
   // Question is going to be A-type if
   // - current question has no K-type version
   // - current question has A-type version and
   //  - previous one was K-type
   //  - or K- and Kprim-type has been deselectred by user 
   if(((gbQisa==0 || gbKtype+gbKprim==0) && gaoQ[0].at[nVer].length>0 && gbAtype==1) || gaoQ[0].kt[nVer].length==0)
      {
	  gbQisa=1; // question is going to be A-type
	  sQtext=gaoQ[0].at[nVer]; // get question text for type
	  }
   else
      {
	  gbQisa=0; // question is going to be K-type
	  sQtext=gaoQ[0].kt[nVer]; // get question text for type
	  if(gbQisp==0 && gbKprim==1)
	    {
		gbQisp=1; // toggle from non-prim to prim if user allows prim	
		}
	  else if(gbQisp==1 && gbKtype==1)
	    {
		gbQisp=0; // toggle from prim to non-prim if user allows non-prim	
		}
	  }
	  
   // Update usage count and show it if debugging flag set
   gaoQ[0].un[nVer]=gaoQ[0].un[nVer]+1
   if (gbDu>0) sQtext= '('+gaoQ[0].un[nVer]+') ' + sQtext;

   // Complement question ID with version number for looking up qualifying answers
   sQid= gaoQ[0].id + (1+nVer);
   
   // Build image path if question has associated image. If quesion has image
   // determine whether answers are position dependent.
   // Select one at random if several versions of the image are available 
   if(gaoQ[0].is[nVer]>0)
      {
      sImg='Img/'+sQid+'-'+Math.round(gaoQ[0].is[nVer]*Math.random()+0.5)+'.jpg';
	  bPos=false; // positive number in field is = postition independent answers
	  }
   else if(gaoQ[0].is[nVer]<0)
      {
      sImg='Img/'+gaoQ[0].id+'-0'+(nVer+1)+'.jpg';
	  bPos=true; // -1 in field is = postition dependent answers with labels
	  }
   else
      {
      sImg='';
	  bPos=false; // answers to questions without images always position independent
	  }
  
   // Move question to end of questions array to prevent re-use
   gaoQ.splice(gnQtop,0,gaoQ[0]);
   gaoQ.splice(0,1);
    
   // Initialize used answer texts string
   gsAused=''
   
   // Set answer texts for A-type question
   if(gbQisa==1)
      {
      gnAgood=Math.round(5*Math.random()-0.5); // answer A-E to be correct at random
      asQanswers[0]=Aget (sQid,gnAgood==0); // A
      asQanswers[1]=Aget (sQid,gnAgood==1); // B
      asQanswers[2]=Aget (sQid,gnAgood==2); // C
      asQanswers[3]=Aget (sQid,gnAgood==3); // D
      asQanswers[4]=Aget (sQid,gnAgood==4); // E
	  }
   
   // Set answer texts for K-nonprim question
   else if(gbQisp==0)
      {
	  // Count available correct and incorrect answers
	  Acount (sQid);
	  
	  // Based on number of retreived answers dertermine which combinations ABCDE are possible
	  sKaaaa='ABCDE';
	  if (gnAyy<4) sKaaaa=sKaaaa.replace('E',''); // E needs 4 correct
	  if (gnAyy<3) sKaaaa=sKaaaa.replace('A',''); // A needs 3 correct
	  if (gnAyy<2) {sKaaaa=sKaaaa.replace('B',''); sKaaaa=sKaaaa.replace('C','');} // BC need 2 correct
	  if (gnAnn<3) sKaaaa=sKaaaa.replace('D',''); // D needs 3 false
	  if (gnAnn<2) {sKaaaa=sKaaaa.replace('B',''); sKaaaa=sKaaaa.replace('C','');} // BC need 2 false
	  if (gnAnn<1) sKaaaa=sKaaaa.replace('A',''); // A needs 1 false
	  
	  // If apropriate determine answer combination to be correct
	  // preventing display of error mesages instead of answer statements
	  if (sKaaaa.length>0)
	     {
	     gnAgood=Math.round(sKaaaa.length*Math.random()-0.5); // one of the possible combinations at random
		 sKaaaa=sKaaaa.substring(gnAgood,gnAgood+1); // corresponding letter A-E
		 gnAgood=sAbcde.indexOf(sKaaaa); 
		 }
		  
      // A=1+2+3 correct
	  if (gnAgood==0)
         {
         asQanswers[0]=Aget (sQid,true);
         asQanswers[1]=Aget (sQid,true);
         asQanswers[2]=Aget (sQid,true);
         asQanswers[3]=Aget (sQid,false);
   	     }
   
      // B=1+3 correct
      else if (gnAgood==1)
         {
         asQanswers[0]=Aget (sQid,true);
         asQanswers[2]=Aget (sQid,true);
         asQanswers[1]=Aget (sQid,false);
         asQanswers[3]=Aget (sQid,false);
	     }
   
      // C=2+4 correct
      else if (gnAgood==2)
         {
         asQanswers[1]=Aget (sQid,true);
         asQanswers[3]=Aget (sQid,true);
         asQanswers[0]=Aget (sQid,false);
         asQanswers[2]=Aget (sQid,false);
	     }
   
      // D=4 correct
      else if (gnAgood==3)
         {
         asQanswers[3]=Aget (sQid,true);
         asQanswers[0]=Aget (sQid,false);
         asQanswers[1]=Aget (sQid,false);
         asQanswers[2]=Aget (sQid,false);
	     }
   
      // E=1+2+3+4 correct
      else
         {
         asQanswers[0]=Aget (sQid,true);
         asQanswers[1]=Aget (sQid,true);
         asQanswers[2]=Aget (sQid,true);
         asQanswers[3]=Aget (sQid,true);
	     }
	  }
   
   // Set answer texts for K-prim question
   else
      {
	  // Count available correct and incorrect answers
	  Acount (sQid);
	  if (gnAyy>3) {nAyymax=4} else {nAyymax=gnAyy}
	  if (gnAnn>3) {nAyymin=0} else {nAyymin=4-gnAnn}
	  gnAgood=nAyymin+Math.round((1+nAyymax-nAyymin)*Math.random()-0.5);

      // Build ordered array with correct number of trues
	  for (i=0; i<4; i++)
	     {
		 if(i<gnAgood) {gabAgood[i]=1} else {gabAgood[i]=0}	 
		 }

      // Scramble the array
      gabAgood.splice(Math.round(4*Math.random()+0.5),0,gabAgood[0]);
      gabAgood.splice(0,1);
      gabAgood.splice(Math.round(4*Math.random()+0.5),0,gabAgood[0]);
      gabAgood.splice(0,1);
      gabAgood.splice(Math.round(4*Math.random()+0.5),0,gabAgood[0]);
      gabAgood.splice(0,1);
      gabAgood.splice(Math.round(4*Math.random()+0.5),0,gabAgood[0]);
      gabAgood.splice(0,1);

      // Get answer texts
	  asQanswers[0]=Aget (sQid,gabAgood[0]);
	  asQanswers[1]=Aget (sQid,gabAgood[1]);
	  asQanswers[2]=Aget (sQid,gabAgood[2]);
	  asQanswers[3]=Aget (sQid,gabAgood[3]);
	  }
	  
    // Handle label positioning if necessary
	if (bPos==true)	
	   {
	   // Separate answer text and label string	   
	   for (i=0; i<4; i++) // loop through answers
	      {
		  j=asQanswers[i].indexOf(' :: '); // locate begin of label string
		  if (j>-1)
		     {
		     asQxy[i]=asQanswers[i].substring(0,j+1); // extracted label string
		     asQanswers[i]=asQanswers[i].substring(j+4,asQanswers[i].length); // extracted answer text
			 }
		  else
		     {
			 asQxy[i]='C999999'	 
			 }
		  }
		   
	   // Sort answers in ascending order based on number of available label positions,
	   // so that label selection can start with the answers that have the smallest number of options
	   ai=[0,1,2,3];
	   for (i=1; i<4; i++) // loop through index array
	      {
		  if (asQxy[ai[i]].length<asQxy[ai[i-1]].length) // swap elements if in wrong order
		     {
			 ii=ai[i-1];
			 ai[i-1]=ai[i];
			 ai[i]=ii;
			 i=0; // start over with order checking after every swap
			 }
		  }
	   
	   // Select one label for each answer, radomly but avoiding collisions
	   for (i=0; i<4; i++) // loop through answers in modified order
	      {
		  // asQanswers[ai[i]]=asQanswers[ai[i]]+' ['+i+'-'+asQxy[ai[i]].length*0.125+'] ' /////////////////////////// debugging
			  
		  // Eliminate labels of current answer that collide with already placed lables
		  sQxyok=''; // initialize buffer to collect labels that passed collision test
		  sQxyfar=''; // initialize buffer to collect labels that passed distance test
		  for (j=0; j<asQxy[ai[i]].length; j=j+8) // loop through labels of current answer
		     {
			 // Extract label data
			 sQxytest=asQxy[ai[i]].substring(j,j+8); // label to be tested
			 sQlbttest=sQxytest.substring(0,1); // type of label to be tested
			 Qlbxtest=Number(sQxytest.substring(1,4)); // x pos of label to be tested
			 Qlbytest=Number(sQxytest.substring(4,8)); // y pos of label to be tested
			 
			 // Check against already placed labels
			 bCls=0; // no collision by default
			 bNear=0; // no near label by default
			 for (ii=0; ii<i; ii++) // for each label loop through already placed labels 
			    {
				// asQanswers[ai[i]]=asQanswers[ai[i]]+ai[ii] /////////////////////////// debugging	
					
				// x-distance
				if (Qlbxtest<aQlbx[ai[ii]]) // tested label left of reference
				   {
				   dx=gQiscal*(aQlbx[ai[ii]]-Qlbxtest); // distance between targets, scaled to final image size
				   if (sQlbttest=='R') {dx=dx-41;} // correction for test label type
				   if (sQlbttest=='T' || sQlbttest=='B') {dx=dx-10;} 
				   if (asQlbt[ai[ii]]=='L') {dx=dx-41;} // correction for reference label type
				   if (asQlbt[ai[ii]]=='T' || asQlbt[ai[ii]]=='B' || asQlbt[ai[ii]]=='C') {dx=dx-10;}
				   }
				else // tested label right of reference
				   {
				   dx=gQiscal*(Qlbxtest-aQlbx[ai[ii]]); // distance between targets, scaled to final image size
				   if (sQlbttest=='L') {dx=dx-41;} // correction for test label type
				   if (sQlbttest=='T' || sQlbttest=='B') {dx=dx-10;} 
				   if (asQlbt[ai[ii]]=='R') {dx=dx-41;} // correction for reference label type
				   if (asQlbt[ai[ii]]=='T' || asQlbt[ai[ii]]=='B' || asQlbt[ai[ii]]=='C') {dx=dx-10;}
				   }

				// y-distance
				if (Qlbytest>aQlby[ai[ii]]) // tested label below reference
				   {
				   dy=gQiscal*(Qlbytest-aQlby[ai[ii]]); // distance between targets, scaled to final image size
				   if (sQlbttest=='T') {dy=dy-41;} // correction for test label type
				   if (sQlbttest=='L' || sQlbttest=='R') {dy=dy-10;} 
				   if (asQlbt[ai[ii]]=='B') {dy=dy-41;} // correction for reference label type
				   if (asQlbt[ai[ii]]=='L' || asQlbt[ai[ii]]=='R' || asQlbt[ai[ii]]=='C') {dy=dy-10;}
				   }
				else // tested label above reference
				   {
				   dy=gQiscal*(aQlby[ai[ii]]-Qlbytest); // distance between targets, scaled to final image size
				   if (sQlbttest=='B') {dy=dy-41;} // correction for test label type
				   if (sQlbttest=='L' || sQlbttest=='R') {dy=dy-10;} 
				   if (asQlbt[ai[ii]]=='T') {dy=dy-41;} // correction for reference label type
				   if (asQlbt[ai[ii]]=='L' || asQlbt[ai[ii]]=='R' || asQlbt[ai[ii]]=='C') {dy=dy-10;}
				   }
				
				// Check distance
				if (dy<10 && dx<10) {bCls=1;} // collision
				if (dy<100 && dx<100) {bNear=1;} // near
				}
			 if (bCls==0) {sQxyok=sQxyok+sQxytest;} // if no collision add to collection of tested labels
			 if (bNear==0) {sQxyfar=sQxyfar+sQxytest;} // if not near add to collection of far labels
			 }
		  
		  // If any lables survived checking use only those, else use all
		  if (sQxyfar.length>1) // far labels available
		     {
		     // asQanswers[ai[i]]=asQanswers[ai[i]]+' (far)'; /////////////////////////// debugging
		     asQxy[ai[i]]=sQxyfar;
			 }
		  else if (sQxyok.length>1) // only near labels
		     {
		     // asQanswers[ai[i]]=asQanswers[ai[i]]+' (near)'; /////////////////////////// debugging
		     asQxy[ai[i]]=sQxyok;
			 }
		  else // not even near labels: use all labels if collision unavoidable

		     {
		     // asQanswers[ai[i]]=asQanswers[ai[i]]+' (collision!)'; /////////////////////////// debugging
			 }
		  
		  // Randomly select one of the available labels
		  j=Math.round(asQxy[ai[i]].length*Math.random()/8-0.5); 
		  asQlbt[ai[i]]=asQxy[ai[i]].substring(8*j+0,8*j+1); // extract label type
		  aQlbx[ai[i]]=Number(asQxy[ai[i]].substring(8*j+1,8*j+4)); // extract x position
		  aQlby[ai[i]]=Number(asQxy[ai[i]].substring(8*j+4,8*j+7)); // extract y position
		  }
	   }

   // Build HTML code to display question.
   // Title, navigation and performance monitor.
   sTape += '<img src="../Gif/T.gif" width="22" height="10" alt="">'; // indent spacer
   if (gbDs>0)
      sTape += '<strong>Frage ' + gnQnum + ' ('+ sAbcde.charAt(gnAgood) + ')</strong>'; // question number with sloution
   else	  
      sTape += '<strong>Frage ' + gnQnum + '</strong>'; // question number without solution
   sTape += '<img src="../Gif/T.gif" width="30" height="10" alt="">'; // horizontal spacer
   sTape += ' [ <a href="javascript: Qnext();"> nächste Frage </a> ]';
   sTape += ' [ <a href="javascript: Qstop();"> Stopp </a> ]';
   if(gnQnum>1) // performance monitor starts with 2nd question
      {
      sTape += ' (bisher ' + Math.round(100*(gnQsolved)/(gnQnum-1)) + '% richtig';
	  sTape += ' = ' + gnQsolved + ' von ' + (gnQnum-1) + ')'; 
	  }
   sTape += '<br>';
   
   // Start table / form for question content (4 columns)
   sTape += '<img src="../Gif/T.gif" width="29" height="20" alt="">'; // vertical spacer
   sTape += '<br>';
   sTape += '<form>' ;
   sTape += '<table class="text" width="460" cellpadding="3" cellspacing="0" border="0">';
   
   // Row for question text
   sTape += '<tr>';
   sTape += '<td></td>';
   sTape += '<td colspan="3">' + sQtext + '</td>';
   sTape += '</tr>';

   // Row for formatting column widths
   sTape += '<tr>';
   sTape += '<td><img src="../Gif/T.gif" width="13" height="10" alt=""></td>';
   sTape += '<td><img src="../Gif/T.gif" width="20" height="10" alt=""></td>';
   sTape += '<td><img src="../Gif/T.gif" width="17" height="10" alt=""></td>';
   sTape += '<td><img src="../Gif/T.gif" width="400" height="10" alt=""></td>';
   sTape += '</tr>';
   
   // Question text
   if (gbQisa==true) // 5 A-type answers
      {
      for (i=0; i<5; i++)
         {
         sTape += '<tr>';
         sTape += '<td valign="top"><img name="img' + i + '" id="' + i + '" src="answer.gif"></td>'; // placeholder for icon correct/wrong 
         sTape += '<td valign="top"><input type="radio" name="ans" form="Answers" value=' + i + ' onClick="Qcheck(' + i + ');"></td>' ;
         sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + sAbcde.charAt(i) + '</td>' ;
         sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + asQanswers[i] + '</td>' ;
         sTape += '</tr>';
	     }
	  }
   else if(gbQisp==0) // 4 K-nonprim answers  
      {
      for (i=0; i<4; i++) // 4 statements
         {
         sTape += '<tr>';
         sTape += '<td></td>'; 
         sTape += '<td></td>';
         sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + (i+1) + '</td>';
         sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + asQanswers[i] + '</td>';
         sTape += '</tr>';
	     }
     sTape += '<tr>';
     sTape += '<td colspan="4"><img src="../Gif/T.gif" width="1" height="10" alt=""></td>';
     sTape += '</tr>';
     for (i=0; i<5; i++) // 5 combinations to select from
        {
        sTape += '<tr>';
        sTape += '<td valign="top"><img name="img' + i + '" id="' + i + '" src="answer.gif"></td>'; // placeholder for icon correct/wrong 
        sTape += '<td valign="top"><input type="radio" name="ans" value=' + i + ' onClick="Qcheck(' + i + ');"></td>' ;
        sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + sAbcde.charAt(i) + '</td>' ;
        sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' + asKcomb[i] + '</td>' ;
        sTape += '</tr>';
	    }
	  }
   else	// 4 K-prim answers  
      {
	  
	  // Instruction header
	  sTape += '<tr>';
	  sTape += '<td></td>';
	  sTape += '<td valign="top"><img src="../Gif/T.gif" width="6" height="13" alt="">+<img src="../Gif/T.gif" width="14" height="13" alt="">-</td>';
	  sTape += '<td></td>';
	  sTape += '<td valign="top">+ richtig / - falsch<img src="../Gif/T.gif" width="15" height="13" alt=""></td>';
	  sTape += '</tr>';
      
	  // 4x double radio button + answer text
	  for (i=0; i<4; i++)
         {
		 sTape += '<tr>';
         sTape += '<td valign="top"><img name="img' + i + '" id="' + i + '" src="answer.gif"></td>'; // placeholder for icon correct/wrong 
         sTape += '<td colspan="2" valign="top"><input type="radio" name="prim' + i + '" value=1 onClick="Qcprim(' + i + ',1);">' ;
		 sTape += '<input type="radio" name="prim' + i + '" value=2 onClick="Qcprim(' + i + ',0);"></td>' ;
         sTape += '<td valign="top"><img src="../Gif/T.gif" width="1" height="13" alt="">' ;
         if (bPos==true) sTape += (i+1) + ' = ' ;
         sTape += asQanswers[i] + '</td>' ; // add coordinates:  + ' ' + aQlbx[i] + ' ' + aQlby[i]
         sTape += '</tr>';
	     }
	  }
 
   // Close table / form for question content
   sTape += '</table>';
   sTape += '</form>';
   sTape += '<tr>';
   
   // Display HTML code for the question on document layer 'Qinterface'
   document.getElementById('Qinterface').innerHTML = sTape;
   
   // Question image & labels if needed
   if (sImg!='')
      {
      
	  // image
	  sTape = '<img src="../Gif/T.gif" width="28" height="401" alt="">'; // 401=373+28 
      sTape += '<img src="' + sImg +'" width="560" height="373" alt="" border=1>'; // original 750x500, scale 0.74666667
	  document.getElementById('Qimg').innerHTML = sTape;
	  
	  // labels
	  if (bPos==true)
	     {
		 
		 // Label 1
		 x=0.74667*aQlbx[0]-30
		 if (asQlbt[0]=='L'){x=x-30;}
		 if (asQlbt[0]=='R'){x=x+30;}
		 if (x>525) x=525; // adjust upper right corner x
		 y=0.74667*aQlby[0]+30
		 if (asQlbt[0]=='T') {y=y-30;}
		 if (asQlbt[0]=='B') {y=y+30;}
		 if (y<2) y=2; // aejust upper right corner y
		 sTape = '<img src="../Gif/T.gif" width="'+(29+x)+'" height="'+(28+y)+'" alt="">'; 
		 sTape += '<img src="../Gif/1'+asQlbt[0]+'.gif" alt="">';
		 document.getElementById('Qlb1').innerHTML = sTape;	// each label has own layer
		 
		 // Label 2
		 x=0.74667*aQlbx[1]-30
		 if (asQlbt[1]=='L'){x=x-30;}
		 if (asQlbt[1]=='R'){x=x+30;}
		 if (x>525) x=525; // adjust upper right corner x
		 y=0.74667*aQlby[1]+30
		 if (asQlbt[1]=='T') {y=y-30;}
		 if (asQlbt[1]=='B') y=y+30;
		 if (y<2) y=2; // aejust upper right corner y
		 sTape = '<img src="../Gif/T.gif" width="'+(29+x)+'" height="'+(28+y)+'" alt="">'; 
		 sTape += '<img src="../Gif/2'+asQlbt[1]+'.gif" alt="">';
		 document.getElementById('Qlb2').innerHTML = sTape;	// each label has own layer	 
		 
		 // Label 3
		 x=0.74667*aQlbx[2]-30
		 if (asQlbt[2]=='L'){x=x-30;}
		 if (asQlbt[2]=='R'){x=x+30;}
		 if (x>525) x=525; // adjust upper right corner x
		 y=0.74667*aQlby[2]+30
		 if (asQlbt[2]=='T') {y=y-30;}
		 if (asQlbt[2]=='B') y=y+30;
		 if (y<2) y=2; // aejust upper right corner y
		 sTape = '<img src="../Gif/T.gif" width="'+(29+x)+'" height="'+(28+y)+'" alt="">'; 
		 sTape += '<img src="../Gif/3'+asQlbt[2]+'.gif" alt="">';
		 document.getElementById('Qlb3').innerHTML = sTape;	// each label has own layer	 
		 
		 // Label 4
		 x=0.74667*aQlbx[3]-30
		 if (asQlbt[3]=='L'){x=x-30;}
		 if (asQlbt[3]=='R'){x=x+30;}
		 if (x>525) x=525; // adjust upper right corner x
		 y=0.74667*aQlby[3]+30
		 if (asQlbt[3]=='T') {y=y-30;}
		 if (asQlbt[3]=='B') y=y+30;
		 if (y<2) y=2; // aejust upper right corner y
		 sTape = '<img src="../Gif/T.gif" width="'+(29+x)+'" height="'+(28+y)+'" alt="">'; 
		 sTape += '<img src="../Gif/4'+asQlbt[3]+'.gif" alt="">';
		 document.getElementById('Qlb4').innerHTML = sTape;	// each label has own layer	 
		 }
	  else
	     {
			 
		 // Make sure label layers are empty
		 document.getElementById('Qlb1').innerHTML = '';	 
		 document.getElementById('Qlb2').innerHTML = '';	 
		 document.getElementById('Qlb3').innerHTML = '';	 
		 document.getElementById('Qlb4').innerHTML = '';	 
		 }
	  }
   else
      {
		  
	  // Make sure label layers are empty
	  document.getElementById('Qimg').innerHTML = '';
	  document.getElementById('Qlb1').innerHTML = '';
	  document.getElementById('Qlb2').innerHTML = '';	 
	  document.getElementById('Qlb3').innerHTML = '';	 
	  document.getElementById('Qlb4').innerHTML = '';	 
	  }

   } // end of Qnext


// Select a topic: count qualifying questions in array of question objects
// and move them to the beginning of the array. Called for every checked topic when
// new session is started by call to function Qinit().
function Topicsel (sTopic)
   {
   // scan array of question objects starting at gnQtop because questions
   // that have been selected already do not need to be re-scanned
   for (i=gnQtop; i<gaoQ.length; i++) 
      {
	  // Check topic and consider inclusion probability setting
	  if (gaoQ[i].id.indexOf(sTopic)>-1 && Math.random()<(0.000001+gaoQ[i].p))
  	     {
		 // If question qualifies move it to random position with already selected
		 // questions to create different order of questions for each new session
		 gaoQ.splice(Math.round((gnQtop+1)*Math.random()-0.5),0,gaoQ[i]);
		 gaoQ.splice(i+1,1);
		 gnQtop+=1;	 
		 }
	  }
   }
