import React, { useEffect, useState } from "react";
import {  deletePlayer, getAllPlayer } from "../../api/api";
import { toast } from "react-toastify";
import ToastMsg from "../../components/toast/ToastMsg";
import { imageRender } from "../../utils/helpers";
import ActionButton from "../../components/button/ActionButton";
import { reactIcons } from "../../utils/icons";
import DeleteButton from "../../components/button/DeleteButton";
import DeleteConfirmation from "../../components/modals/DeleteConfirmation";
import { useLocation, useParams } from "react-router-dom";
import AddTeam from "../../components/modals/AddTeam";
import RenderNoData from "../../components/layout/RenderNoData";
import AddPlayer from "../../components/modals/AddPlayer";

const Player = () => {
  const [loading,setLoading]=useState(false)
  const location = useLocation();
  const { teamId } = useParams();
  const [player, setPlayer] = useState(null);
  const [isConfirmedOpen, setIsConfirmedOpen] = useState(false);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [players, setPlayers] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const getAllPlayerData = async () => {
    setFetchLoading(true)
    try {
      const res = await getAllPlayer({ id: teamId });
      const { status, data } = res;
      if (status >= 200 && status <= 300) {
        setPlayers(data);
      } else {
        toast.error(<ToastMsg title={data.message} />);
      }
    } catch (error) {
      toast.error(<ToastMsg title={error?.response?.data?.message} />);
    }finally{
      setFetchLoading(false)
    }
  };

  useEffect(() => {
    if (teamId){
      getAllPlayerData();

    }
  }, [teamId]);

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await deletePlayer(player?._id);
      const { status, data } = res;
      if (status >= 200 && status <= 300) {
        toast.success(<ToastMsg title="Deleted Successfully" />);
        setIsConfirmedOpen(false);
        getAllPlayerData();
      } else {
        toast.error(<ToastMsg title={data.message} />);
      }
    } catch (error) {
      toast.error(<ToastMsg title={error?.response?.data?.message} />);
    }finally{
      setLoading(false)
    }
  };
  return (
    <>
      <div>
        <header className="mb-4 flex items-center justify-between">
          <h3 className="heading-3">
            All players of {location?.state?.name}{" "}
          </h3>
          <button
            onClick={() => setIsAddNewOpen(true)}
            className="btn-primary"
          >
            Add New Player{" "}
          </button>
        </header>
        <div>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr>
                  <th className="w-[80px]">Sr.No</th>
                  <th>Name</th>
                  <th>Team</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {players?.map((player, index) => (
                  <tr>
                    <td className="w-[80px]">{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.team?.name}</td>
                    <td>{player.role}</td>
                   
                    <td>
                      <div className="flex justify-center gap-2">
                        <ActionButton
                          onClick={() => {
                            setPlayer(player);
                            setIsAddNewOpen(true);
                          }}
                        >
                          {reactIcons.edit}
                        </ActionButton>
                        <DeleteButton
                          onClick={() => {
                            setPlayer(player);
                            setIsConfirmedOpen(true);
                          }}
                        >
                          {reactIcons.delete}
                        </DeleteButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {players?.length < 1 && !fetchLoading && <RenderNoData title={'No players available'} />}
                {fetchLoading && <div className="py-8 text-center font-semibold">Loading please wait....</div>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddPlayer
        isOpen={isAddNewOpen}
        player={player || null}
        closeModal={() => {
          setIsAddNewOpen(false);
          setPlayer(null);
          getAllPlayerData()
        }}
        fetch
        teamId={teamId}
      />
      <DeleteConfirmation
        isOpen={isConfirmedOpen}
        closeModal={() => setIsConfirmedOpen(false)}
        handleDelete={handleDelete}
        title={"Player"}
        loading={loading}
      />
    </>
  );
};

export default Player;
