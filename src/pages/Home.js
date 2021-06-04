import React, { useState } from 'react';
import Hero from '../components/Hero/Hero';
import InfoSection from '../components/InfoSection/InfoSection';
import { section1, section2 } from '../components/InfoSection/Data';
import Navbar from '../components/Navbar/Navbar';
import NavbarDropDown from '../components/NavbarDropDown/NavbarDropDown';
import Tiles from '../components/Tiles/Tiles';
import Footer from '../components/Footer/Footer';

const Home = () => {
	const [ isOpen, setIsOpen ] = useState(false);

	const toggle = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div>
			<NavbarDropDown isOpen={isOpen} toggle={toggle} />
			<Navbar toggle={toggle} />
			<Hero />
			<InfoSection {...section1} />
			<InfoSection {...section2} />
			<Tiles />
			<Footer />
		</div>
	);
};

export default Home;
