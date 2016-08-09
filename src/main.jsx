var React = require('react');
var ReactDOM = require('react-dom');


var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

var StarsFrame = React.createClass({
  render:function(){
    var stars = [];
    for(var i = 0; i < this.props.numberOfStars; i++){
      stars.push(<span className="glyphicon glyphicon-star"></span>);
    };
    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
  }
});

var ButtonFrame = React.createClass({
    render: function () {
      var button;
      var correct = this.props.correct;
      var disabled;

      switch(correct) {
        case true:
          button = (
            <button className="btn btn-success btn-lg" onClick={this.props.acceptAnswer}>
              <span className="glyphicon glyphicon-ok"></span>
            </button>);
          break;
        case false:
          button = (
            <button className="btn btn-danger btn-lg" >
              <span className="glyphicon glyphicon-remove"></span>
            </button>);
          break;
        default:
          disabled =  (this.props.selectedNumbers.length === 0);
          button = (<button className="btn btn-primary btn-lg" disabled={disabled} onClick={this.props.checkAnswer}>=</button>);
      }
      return (
        <div id="button-frame">
          {button}
          <br />
          <button className="btn btn-warning btn-xs" onClick={this.props.redraw} disabled={this.props.redraws===0}>
            <span className="glyphicon glyphicon-refresh"></span>
             {this.props.redraws}
          </button>
        </div>
      );
  }
});

var AnswerFrame = React.createClass({
    render: function () {
        var unselectNumber = this.props.unselectNumber;
        var localSelectedNumbers = this.props.selectedNumbers.map(function (number) {
            return (<span onClick={unselectNumber.bind(null, number)}>{number}</span>);
        });

    return (
      <div id="answer-frame">
        <div className="well">
          {localSelectedNumbers}
        </div>
      </div>
    );
  }
});

var NumberFrame = React.createClass({
    render: function () {
      var selectNumber = this.props.selectNumber;
      var numbers = [], className, selectedNumbers = this.props.selectedNumbers, usedNumbers=this.props.usedNumbers;
    for(var i = 1; i <=9; i++){
      className = "number selected-" + (selectedNumbers.indexOf(i) > -1);
      className += " used-" + (usedNumbers.indexOf(i) > -1);
      numbers.push(<div className={className} onClick={selectNumber.bind(null, i)}>{i}</div>);
    }
    return (
      <div id="number-frame">
        <div className="well">
            {numbers}
        </div>
      </div>
    );
  }
});

var DoneFrame = React.createClass({
  render: function(){
    return (
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button className="btn btn-default" onClick={this.props.resetGame}>Play Again?</button>
      </div>
    );
  }
});

var Game = React.createClass({
  getInitialState: function(){
      return {
          numberOfStars: this.randomStars(),
          selectedNumbers: [],
          usedNumbers:[],
          correct:null,
          redraws:5,
          doneStatus: null
      };
  },

  resetGame: function(){
    this.replaceState(this.getInitialState());
  },

  randomStars: function(){
    return Math.floor(Math.random() * 9) + 1;
  },

  selectNumber: function (clickedNumber) {
    if(this.state.selectedNumbers.indexOf(clickedNumber) < 0)
      this.setState({ selectedNumbers: this.state.selectedNumbers.concat(clickedNumber) });
  },

  possibleSolutions: function(){
    var numberOfStars = this.state.numberOfStars;
    var possibleNumbers = [], usedNumbers= this.state.usedNumbers;
    for(var i = 1; i < 10; i++){
      if(usedNumbers.indexOf(i) < 0){
        possibleNumbers.push(i);
      }
    }

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  },

  updateDoneStatus: function(){
    if(this.state.usedNumbers.length === 9){
      this.setState({doneStatus: 'Win. Nice!'});
      return;
    }
    if(this.state.redraws===0 && !this.possibleSolutions()){
      this.setState({doneStatus: 'Game Over!'})
    }
  },

  unselectNumber: function (numberToUnselect) {
      var selectedNumbers = this.state.selectedNumbers;
      var indexOfNumber = selectedNumbers.indexOf(numberToUnselect);
      selectedNumbers.splice(indexOfNumber, 1);
      this.setState({selectedNumbers: selectedNumbers})
  },

  sumOfSelectedNumbers: function(){
    return this.state.selectedNumbers.reduce(function(prev, curr){
      return prev + curr;
    },0);
  },

  checkAnswer: function(){
    var correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState({correct:correct});
  },

  acceptAnswer: function(){
    var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    this.setState({
      usedNumbers: usedNumbers,
      selectedNumbers:[],
      correct:null,
      numberOfStars:this.randomStars()}, function(){
        this.updateDoneStatus();
      });
  },

  redraw:function(){
    if(this.state.redraws > 0){
      this.setState({
        numberOfStars:this.randomStars(),
        correct:null,
        selectedNumbers: [],
        redraws: this.state.redraws - 1
      }, function(){
        this.updateDoneStatus();
      });
    }

  },

  render:function(){
    var correct = this.state.correct;
    var usedNumbers=this.state.usedNumbers;
    var bottomFrame;
    var doneStatus = this.state.doneStatus;
    var selectedNumbers = this.state.selectedNumbers;

    if(doneStatus){
      bottomFrame = <DoneFrame doneStatus={doneStatus} resetGame={this.resetGame} />
    } else {
      bottomFrame = <NumberFrame selectedNumbers={this.state.selectedNumbers}  selectNumber = {this.selectNumber} usedNumbers = {usedNumbers} />;
    }

    return (
      <div id="game">
        <h2>Play Nine</h2>
        <hr />
        <div className="clearfix">
          <StarsFrame numberOfStars={this.state.numberOfStars} />
          <ButtonFrame selectedNumbers={selectedNumbers}
            correct = {correct} checkAnswer= {this.checkAnswer}
            acceptAnswer= {this.acceptAnswer} redraw={this.redraw} redraws = {this.state.redraws} />
          <AnswerFrame selectedNumbers={this.state.selectedNumbers} unselectNumber={this.unselectNumber} />
        </div>
        {bottomFrame}
      </div>
    );
  }
})

ReactDOM.render(<Game />, document.getElementById('container'));
