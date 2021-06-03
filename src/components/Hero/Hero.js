import React, { useState } from 'react';
import { HeroContainer, HeroContent, HeroBackground, HeroVideo, HeroH1, HeroP, HeroButtonWrapper, HeroButton, HeroButtonLink, ArrowForward, ArrowRight } from './HeroElements';
import Video from '../../assets/hero_video.mp4';

const Hero = () => {
	const [ hover, setHover ] = useState(false);

	const onHover = () => {
		setHover(!hover);
	};

	return (
		<HeroContainer>
			<HeroBackground>
				<HeroVideo autoPlay loop muted src={Video} type="video/mp4" />
			</HeroBackground>
			<HeroContent>
				<HeroH1>Granblue Automation Statistics</HeroH1>
				<HeroP>View and analysis runs and item drops from the various Farming Modes supported by Granblue Automation.</HeroP>
				<HeroButtonWrapper>
					<HeroButton to="/signup" onMouseEnter={onHover} onMouseLeave={onHover}>
						Get Started {hover ? <ArrowForward /> : <ArrowRight />}
					</HeroButton>
					<HeroButtonLink href="https://github.com/steve1316/granblue-automation-aws-statistics">View on Github</HeroButtonLink>
				</HeroButtonWrapper>
			</HeroContent>
		</HeroContainer>
	);
};

export default Hero;
