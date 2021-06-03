import React from 'react';
import Icon1 from '../../assets/svgNumber.svg';
import Icon2 from '../../assets/svgItem.svg';
import Icon3 from '../../assets/svgTime.svg';
import { TilesContainer, TilesH1, TilesWrapper, TilesCard, TilesIcon, TilesH2, TilesP } from './TilesElements';

const Tiles = () => {
	return (
		<TilesContainer id="tiles">
			<TilesH1>What this Website offers</TilesH1>
			<TilesWrapper>
				<TilesCard>
					<TilesIcon src={Icon1} />
					<TilesH2># of Runs</TilesH2>
					<TilesP>How many runs has users completed for each Mission.</TilesP>
				</TilesCard>
				<TilesCard>
					<TilesIcon src={Icon2} />
					<TilesH2>Item Drops</TilesH2>
					<TilesP>What and how many items were farmed per Mission.</TilesP>
				</TilesCard>
				<TilesCard>
					<TilesIcon src={Icon3} />
					<TilesH2>Time</TilesH2>
					<TilesP>How much time was needed to complete a run.</TilesP>
				</TilesCard>
			</TilesWrapper>
		</TilesContainer>
	);
};

export default Tiles;
