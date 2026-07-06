import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaUsers, FaGlobe, FaLock } from 'react-icons/fa';
import Layout from '../components/Layout';
import useGroup from '../components/hooks/useGroup';
import CreateGroupModal from './CreateGroupModal';
import './css/Community.css';

const Community = () => {
  const navigate = useNavigate();
  const { listGroups, createGroup } = useGroup();
  const [myGroups, setMyGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = async () => {
    setLoading(true);
    const [mine, discover] = await Promise.all([
      listGroups({ mine: true }),
      listGroups({ discover: true }),
    ]);
    setMyGroups(mine);
    setDiscoverGroups(discover);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (payload) => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createGroup(payload);
      if (!result) {
        setCreateError('Failed to create group');
        return null;
      }
      await load();
      navigate(`/community/${result.slug}`);
      return result;
    } finally {
      setCreating(false);
    }
  };

  const GroupCard = ({ group }) => (
    <Link to={`/community/${group.slug}`} className="community-card ice-card community-card--link">
      <div className="community-card-icon">
        {group.is_private ? <FaLock /> : <FaGlobe />}
      </div>
      <h3 className="community-card-name">{group.name}</h3>
      <p className="community-card-desc">{group.description || 'No description yet.'}</p>
      <span className="community-card-meta">
        {group.member_count} members · {group.is_private ? 'Private' : 'Public'}
        {group.membership?.status === 'accepted' && ' · Joined'}
      </span>
    </Link>
  );

  return (
    <Layout>
      <div className="community-page">
        <header className="community-header">
          <div>
            <h1 className="snow-page-title">Community</h1>
            <p className="community-subtitle">
              Join interest groups, share with members, and follow groups to see their posts in your Feed.
            </p>
          </div>
          <button
            type="button"
            className="community-create-btn"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus />
            Create group
          </button>
        </header>

        {loading && <p className="community-loading ice-card">Loading groups…</p>}

        {!loading && (
          <>
            <section className="community-section">
              <h2 className="community-section-title">
                <FaUsers className="community-section-icon" />
                Your groups
              </h2>
              {myGroups.length === 0 ? (
                <p className="community-empty ice-card">You haven&apos;t joined any groups yet.</p>
              ) : (
                <div className="community-grid">
                  {myGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </section>

            <section className="community-section">
              <h2 className="community-section-title">Discover public groups</h2>
              {discoverGroups.length === 0 ? (
                <p className="community-empty ice-card">No public groups yet. Create the first one!</p>
              ) : (
                <div className="community-grid">
                  {discoverGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <CreateGroupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
          saving={creating}
          error={createError}
        />
      </div>
    </Layout>
  );
};

export default Community;
