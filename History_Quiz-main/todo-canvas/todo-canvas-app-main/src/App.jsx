import React from "react";
import {
  createSmartappDebugger,
  createAssistant,
} from "@sberdevices/assistant-client";
import APIHelper from "./APIHelper.js"
import "./App.css";



const initializeAssistant = (getState/*: any*/) => {

  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};



export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor');
    this.state = {
      questions:[{"_id": "", "task": "", "answer1": "", "answer2": "", "answer3": "", "answer4": "", "true_answer": ""},
     
       ],
      answer: '',
      result: '',
      state_answer: 0,
      list_of_topics:[],
      //show_results: [{"task": "", "your_answer": "", "true_answer": ""}],
      show_results: [],
      topic:[{id:'', topic: '', start:0, finish:0}],
      state:0,
      rand: 0,

    }    
    this.assistant = initializeAssistant(() => this.getStateForAssistant() );
    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event
      this.dispatchAssistantAction(action);
    });
    this.assistant.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
    });

  }

  componentDidMount() {   
    console.log('componentDidMount');
    APIHelper.getAllQuestion().then(quest=>{
          console.log('question',quest)
     this.setState({ questions: quest});
     console.log('question2',this.state.questions)   
      this.setState({rand:Math.floor(Math.random() * this.state.questions.length)})
      this.allTopics ()
    })
  }

  getStateForAssistant () {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      item_selector:  this.state.notes
    };
    console.log('getStateForAssistant: state:', this.state.notes)
    return state;
  }

  dispatchAssistantAction (action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'add_note':{
           this.Number_Answers(action.note);  
            break;
         }
        case 'new_note':{
           this.NewQuestion()
           break;
         }
        case 'new_topic':{
          this.ChooseTopic(action.note)
          break;
        }
        case 'show_results':{
          this.setState({state: 2});
          break;
        }
        case 'return_topic':{
          this.setState({state: 0});
          break;
        }
        case 'reset_results':{
          this.setState({show_results: []});
          break;
        }
        default:
          break;
      }
    }
  }

  randomInteger(pow) {
    const rand100 =Math.floor(Math.random() * pow);
    return rand100
  };

  Number_Answers (temp)  {
    if(this.state.state_answer === 0){
      if(temp==='один'||temp==='первый'||temp==='1'||temp===1){
        this.setState({answer:this.state.questions[this.state.rand].answer1});
      }
      else if(temp==='два'||temp==='второй'||temp==='2'||temp===2){
        this.setState({answer:this.state.questions[this.state.rand].answer2});
      }
      else if(temp==="три"||temp==="третий"||temp==="3"||temp===3){
        this.setState({answer:this.state.questions[this.state.rand].answer3});
      }
      else if(temp==="четыре"||temp==="четвертый"||temp==="4"||temp===4){
        this.setState({answer:this.state.questions[this.state.rand].answer4});
      }
  
      if(this.state.answer===this.state.questions[this.state.rand].true_answer)  
        this.setState({result:"Верно"});   
      else this.setState({result:"Неверно"});

      this.setState({ show_results: [...this.state.show_results, {topic: this.state.topic[0].topic, task: this.state.questions[this.state.rand].task, your_answer: this.state.answer, true_answer: this.state.questions[this.state.rand].true_answer, result: this.state.result}] });

    }

    this.setState({state_answer: 1});
  }

 NewQuestion(){
  //const random=this.randomInteger(this.state.questions.length);
    this.setState({state_answer: 0});
    this.setState({state: 1});
    const min=this.state.topic[0].start;
    const max=this.state.topic[0].finish;
    const random=this.getRandomArbitrary(min, max);
    console.log('max', max)
    console.log('min', min)
    this.setState({last:this.state.rand});
    this.setState({rand:random});
    this.setState({answer: ''});
    this.setState({result: ''});
  }

  renderArrayTopics = () => {
    return this.state.list_of_topics.map(({ id, topic}) => <div>{id} {topic}</div>);
  }

  renderArrayResults = () => {
    return this.state.show_results.map(({ topic, task, your_answer, true_answer, result}) => 
      <tr>
        <td className = "Td">{topic} </td>
        <td className = "Td">{task} </td>
        <td>{your_answer} </td>
        <td>{true_answer} </td>
        <td>{result}</td>
      </tr>);
  }

  allTopics (){
    let number=0;
    let start=0;
    let finish=0;
    for(let i=0; i<this.state.questions.length-1;i++ ){
      if(this.state.questions[i].topic!==this.state.questions[i+1].topic){
        finish=i;
        number++;
        this.setState({ list_of_topics: [...this.state.list_of_topics, {id:number, topic:this.state.questions[i].topic, start:start, finish: finish}] });
        start=i+1;

      }if(i===this.state.questions.length-2){
        number++;
        this.setState({ list_of_topics: [...this.state.list_of_topics, {id:number, topic:this.state.questions[i].topic, start:start, finish:i}] });
       }
    }
  }


  ChooseTopic(number){
    let temp=number-1;
    this.setState({state:1})
    this.setState({topic:[{id: this.state.list_of_topics[temp].topic, topic: this.state.list_of_topics[temp].topic, 
      start:this.state.list_of_topics[temp].start, finish:this.state.list_of_topics[temp].finish}]})
      console.log('Topics', this.state.topic)
      const min=this.state.list_of_topics[temp].start;
      const max=this.state.list_of_topics[temp].finish;
      const random=this.getRandomArbitrary(min, max);
      console.log('max', max)
      console.log('min', min)
      this.NewQuestion()
  }

  getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  WriteQuestions(){
    return(    <div className="App">
    <h0 className="Questions"> {this.state.questions[this.state.rand].task}</h0>
    <div className="Answers"> 

       <li>Вариант 1: {this.state.questions[this.state.rand].answer1}</li>
       <li>Вариант 2: {this.state.questions[this.state.rand].answer2}</li>
       <li>Вариант 3:  {this.state.questions[this.state.rand].answer3}</li>
       <li>Вариант 4:  {this.state.questions[this.state.rand].answer4}</li>

     </div>
     <div  >
      
    <div className="Result">
      
    <ul>Ваш Ответ:{this.state.answer} </ul>
    <ul> Результат:{this.state.result} </ul> </div>
     <div className='Text'>
      
     </div >
     </div>
    </div>)
  }


  WriteTopic(){
    return(    
    
    <div className="App">
      <div className="Answers"> 
        <ul>{this.renderArrayTopics()}</ul>
      </div>
      <div>
        <div className='Text'>
        </div >
      </div>
    </div>)
  }

  WriteResults(){
    return(    
    
    <div className="App">
      <div className="Results"> 
        <table /*border="1"  width="30%" height="50%" cellpadding="0" cellspacing="0"*/>
          <thead>
            <tr>
                <th colspan="2">Результаты</th>
            </tr>
          </thead>
          <tbody>
            <tr></tr>
               {this.renderArrayResults()}
          </tbody>
        </table>
      </div>
      <div>
        <div className='Text'>
        </div>
      </div>
    </div>)
  }

  render() {
    console.log('render');
    switch(this.state.state){
      case 0:
        return this.WriteTopic();
      case 1:
        return this.WriteQuestions();
      case 2:
        return this.WriteResults();
      default:
        break;
    }
  }
}
export class Questions extends React.Component {
  render(){
        return(    <div className="App">
    <h0 className="Questions"> {this.state.questions[this.state.rand].task}</h0>
    <div className="Answers"> 

       <li>Вариант 1: {this.state.questions[this.state.rand].answer1}</li>
       <li>Вариант 2: {this.state.questions[this.state.rand].answer2}</li>
       <li>Вариант 3: {this.state.questions[this.state.rand].answer3}</li>
       <li>Вариант 4: {this.state.questions[this.state.rand].answer4}</li>

     </div>
 <div  >

<div className="Result">

<ul>Ваш Ответ:{this.state.answer} </ul>
<ul> Результат:{this.state.result} </ul> </div>
 <div className='Text'>
   
 </div >
 </div>
</div>)
  }
}


export class Answers extends React.Component {
  render(){
  return(    <div className="App">
<h0 className="Questions">  {this.state.questions[this.state.rand].task} </h0>
<div className="Answers"> 
 <ul>{this.renderArrayTopics()}</ul>
</div>
<div  >
  <div className="Result">
    <ul>Ваш Ответ:{this.state.answer} </ul>
    <ul> Результат:{this.state.result} </ul> </div>
    <div className='Text'>
    </div >
  </div>
</div>)
  }
}

