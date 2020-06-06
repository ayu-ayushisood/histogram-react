import React from 'react';
import Chart from "react-google-charts";
import './App.css'
export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      posts: '',
      pages: '',
      lowerLimit: '',
      upperLimit: '',
      slabs: '',
      limitArray: [],
      disabled: true,
      limitCategories: [],
      validated: false
    }
    this.categories = ["Posts", "Pages"];
  }
  async componentDidMount(){
    let responsePosts = await fetch("https://www.vdocipher.com/blog/wp-json/wp/v2/posts?per_page=100");
    let responsePages = await fetch("https://www.vdocipher.com/blog/wp-json/wp/v2/pages?per_page=100");
    let bodyPosts = await responsePosts.json(); 
    let bodyPages = await responsePages.json();
    this.setState({
      posts: bodyPosts, 
      pages: bodyPages
    });
  }

  countWordsAndPrepareChart(){
    let wordsArray=[], limitCategories= [];
    let categoryArray = [this.state.posts, this.state.pages];
    categoryArray.map((category)=>{
      category.map((element)=>{
        let count = 0, result, indices = [];
        let regex = /\b\w+\b/g;
        let htmlContent = element.content.rendered;
        while ((result = regex.exec(htmlContent))) {
          indices.push(result.index);
        }
        count += indices.length;
        wordsArray.push(count);
      });
      limitCategories.push(this.prepareChart(wordsArray));
      
    });
    let posts = limitCategories[0];
    let pages = limitCategories[1]
    posts = posts.unshift(["Posts word count", "Count"]);
    pages = pages.unshift(["Pages word count", "Count"]);
    return limitCategories;
  }

  prepareChart(wordsArray){
    let {upperLimit, lowerLimit, slabs} = this.state;
    let difference = upperLimit - lowerLimit;
    let slab = 0, limitArray = [];
    while(slab<slabs){
      limitArray[slab] = [lowerLimit + '-' + upperLimit];
      lowerLimit = upperLimit;
      upperLimit = parseFloat(upperLimit) + parseFloat(difference);
      slab++;
    }
    let lastElement = limitArray[limitArray.length-1];
    lastElement[0] = lowerLimit + '-' + "Infinity";
    limitArray = limitArray.map((limit)=>{
      let localLimitsArray = limit[0].split("-");
      localLimitsArray[0] =+ localLimitsArray[0];
      localLimitsArray[1] =+ localLimitsArray[1];
      let result = wordsArray.filter((count)=>{
        if(count > localLimitsArray[0] && count <= localLimitsArray[1])
          return count;
        if(localLimitsArray[1] == 'Infinity' && count > localLimitsArray[0]){
          return count; 
        }
      })
      limit.push(result.length);
      return limit;
    });

    // limitArray.unshift(["Posts", "Count"]);
    this.setState({limitArray: limitArray});
    
    return limitArray;
  }
  
  handleChange(e){
    this.setState({
      [e.target.name]: e.target.value,
    },()=>{
        if((this.state.upperLimit && this.state.lowerLimit && this.state.slabs))
          this.setState({disabled: false})
        else
          this.setState({disabled: true})  
      });
    
  }

  validateValues(){
    if((this.state.upperLimit && this.state.lowerLimit && this.state.slabs)!== '')
      return true;
    else
      return false;
  }

  submitForm(e){
    e.preventDefault();
    
    if(this.validateValues()){
      let limitCategories = this.countWordsAndPrepareChart();
      this.setState({limitCategories: limitCategories})
    }
    else
      this.setState({validated: false})
  }

  render(){
     return(
      <div className="main-container">
        <form >
          <input 
            type="number" 
            name="lowerLimit"
            placeholder="Enter Lower limit"
            value={this.state.lowerLimit}
            className="input"
            onChange={this.handleChange.bind(this)}
          />
          <input 
            type="number" 
            placeholder="Enter Upper limit"
            name="upperLimit"
            value={this.state.upperLimit}
            className="input"
            onChange={this.handleChange.bind(this)}
          />
          <input 
            type="number" 
            placeholder="Enter no. of slabs"
            name="slabs"
            value={this.state.slabs}
            className="input"
            onChange={this.handleChange.bind(this)}
          />
          <button onClick={this.submitForm.bind(this)} disabled={this.state.disabled} className="submit-btn">Make Chart</button>
        </form>
        {this.state.limitCategories && this.state.limitCategories.length > 0 ?
          this.state.limitCategories.map((category, ind)=>{
            return(
              <div key={ind}>
                <h4>{category[0][0]}</h4>
                <Chart  
                  chartType="ColumnChart"
                  width="100%"
                  height="400px"
                  data={category}
                />
              </div>
            )
          })
           : ''
        }
      </div>
      
    )
  }
}