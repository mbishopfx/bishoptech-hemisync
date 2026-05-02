export function profileSelect() {
  return 'id,email,username,display_name,full_name,bio,avatar_url,cover_url,website_url,x_url,instagram_url,youtube_url,tiktok_url,profile_visibility,onboarding_complete,plan,created_at,updated_at';
}

export function savedToneSelect() {
  return 'id,user_id,source_session_id,render_id,name,description,cover_image_url,target_state,frequency_plan,duration_sec,base_freq_hz,delta_path,wav_url,mp3_url,artifact_id,visibility,use_count,like_count,created_at,updated_at,profiles(id,username,display_name,avatar_url)';
}

export function feedPostSelect() {
  return 'id,user_id,tone_id,post_type,body,visibility,like_count,comment_count,created_at,updated_at,profiles(id,username,display_name,avatar_url),saved_tones(id,name,description,cover_image_url,target_state,duration_sec,base_freq_hz,delta_path,wav_url,mp3_url,visibility,like_count,user_id)';
}
