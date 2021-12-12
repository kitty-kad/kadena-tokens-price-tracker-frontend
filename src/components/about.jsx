import kadena_kad from './../kadena_kad.png';


export const About = (props) => {
  return (
    <div id='about' className='text-center'>
      <div className='container'>
        <div className='row' style={rowStyle}>
          <div className='col-xs-12 col-md-6'>
            {' '}
            <img src={kadena_kad} style={imgStyle} className='img-responsive' alt='' />{' '}
          </div>
          <div className='col-xs-12 col-md-6'>
            <div className='about-text'>
              <h2>What is this?</h2>
              <p>{props.data ? props.data.paragraph : 'loading...'}</p>
              <p> Visit the <a href="https://kittykad.com">Kitty Kad</a> site for more info </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const rowStyle = {
  width: "100%",
  alignItems: "center",
  justifyContent: "center"
};

const imgStyle = {
  marginLeft: "auto",
  marginRight: "auto",
  display: "block",
  paddingBottom: "20px"
};