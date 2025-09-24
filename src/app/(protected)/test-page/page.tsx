"use client";

export default function TestPage() {
  console.log("🎯 TEST PAGE LOADED!");
  
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '30px',
      textAlign: 'center',
      fontWeight: 'bold'
    }}>
      🎯 TEST PAGE - IF YOU SEE THIS, NEW CODE WORKS! 🎯
      <br/>
      <button 
        style={{
          fontSize: '20px',
          padding: '20px',
          marginTop: '20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '10px'
        }}
        onClick={() => {
          alert("TEST BUTTON CLICKED!");
          console.log("🎯 Test button clicked!");
        }}
      >
        CLICK ME TEST
      </button>
    </div>
  );
}