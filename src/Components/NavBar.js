// Components/NavBar.js
import { Link } from 'react-router-dom';

const NavBar = () => {
 return (
 <nav>
       <ul>
          <li>
             <Link to="/">Home</Link>
          </li>
          <li>
             <Link to="/animebingo">Anime Bingo</Link>
          </li>
          <li>
             <Link to="/wheelspin">Wheel Spin</Link>
          </li>
       </ul>
 </nav>
 );
};

export default NavBar;