import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { numberWithCommas } from "../../utils/helpers";
import { reactIcons } from "../../utils/icons";
const MatchCard = ({ match }) => {
  return (
    <Link to={`/match/${match._id}`} className="p-4 border border-zinc-300 rounded-md">
      <div className="flex justify-between items-start gap-2 ">
        <div className="flex-grow">
          <div className=" flex items-center gap-1 ">
            <img className="w-8 h-8 object-contain mr-1" src={match?.home?.icon} alt="" />
            <p>{match?.home?.name}</p>
            <b className="self-center">Vs</b>
            <img className="w-8 h-8 object-contain mr-1" src={match?.away?.icon} alt="" />
            <p>{match?.away?.name}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
              <div className={`
            font-semibold
            ${match?.status === 'Live' && 'text-red-500'}
            ${match?.status === 'Completed' && 'text-green-500'}
            ${match?.status === 'Pending' && 'text-gray-500'}
            `}>
              {match?.status === 'Live' && 'Match is live'}
              {match?.status === 'Completed' && 'Match is Completed'}
              {match?.status === 'Pending' && 'Match not started yet'}
              
              </div>
          </div>

        </div>

        <div className="flex flex-col items-end gap-1">
          <button className="btn-primary btn-sm ">Join</button>
        </div>
      </div>
      <div className="flex items-start gap-1 justify-between mt-4">
        <div>
          <p>Starts at <b>{moment(match?.time)?.format('DD MMM, HH:mm')}</b> </p>
          <p>Pool Amount  Rs.<b> {numberWithCommas(match?.winningAmount)}</b> </p>
        </div>
        <div>
          <p>Entry Fees  Rs.<b> {match?.entryFees}</b> </p>
          <p>Winnings  <b> {match?.winningPercentage}%</b> </p>
        </div>

      </div>
    </Link>
  );
};

export default MatchCard;
