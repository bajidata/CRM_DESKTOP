with gvars as ( -- JILI আনলিমিটেড ফ্রি স্পিন
  SELECT
    'JILI আনলিমিটেড ফ্রি স্পিন' as bonus_title
    ,'rt00005 - JILI Daily Unlimited Free Spins' as bonus_code 
    ,500 as min_init_deposit --min deposit amount
    ,TIMESTAMP '{{start_date}}' as start_date --localtime
    ,TIMESTAMP '{{end_date}}' as end_date  -- localtime
)

,bonus_claimers as (
  SELECT 
      account_user_id 
      ,currency_type_name 
      ,MIN(from_unixtime((create_time / 1000) + 21600)) AS opt_in_tm
    FROM ads_mcd_bh_account_bonus_turnover  
    WHERE bonus_code in (SELECT bonus_code FROM gvars)
      AND bonus_title in (SELECT bonus_title FROM gvars)
      AND init_deposit >= (SELECT min_init_deposit FROM gvars)
      AND from_unixtime((create_time / 1000) + 21600) between (SELECT start_date FROM gvars) AND (SELECT end_date FROM gvars)
  GROUP BY 1,2
)
,bonus_exclusion as (
  SELECT 
    bc.account_user_id 
    ,SUM(bonus) as bonus_amt
  FROM bonus_claimers bc
  LEFT JOIN (SELECT 
      account_user_id 
      ,bonus 
    FROM ads_mcd_bh_account_bonus_turnover
    WHERE from_unixtime((create_time / 1000) + 21600) 
      between (SELECT start_date FROM gvars) AND (SELECT end_date FROM gvars)) bt
  ON bc.account_user_id = bt.account_user_id
  GROUP BY 1
)

,game_txn as (
  SELECT 
    bc.account_user_id 
    ,sum(turnover) as turnover 
    ,FLOOR(SUM(gt.turnover) / 5000) * 10 AS to_free_spins
    ,count(*) as game_count
    ,CASE WHEN count(*) >= 300 THEN 10 ELSE 0 END as gc_free_spins 
    ,sum(profit_loss) as profit_loss 
  FROM bonus_claimers bc
  LEFT JOIN (SELECT 
      account_user_id
      ,turnover 
      ,profit_loss 
      ,from_unixtime((settle_time / 1000) + 21600) as settle_tm
    FROM ads_mcd_bh_game_transaction 
    WHERE game_type_name = 'SLOT'
      AND game_vendor_name = 'JILI'
      AND system_txn_status_name = 'SETTLED'
      AND bonus_wallet_bet_type_name <> 'Bonus Wallet'
      AND settle_date_id 
        between (SELECT cast(date(start_date) - interval '1' day as VARCHAR ) FROM gvars) 
          AND (SELECT cast(date(end_date) + interval '1' day as VARCHAR ) FROM gvars) ) gt
  ON bc.account_user_id = gt.account_user_id 
  WHERE settle_tm between opt_in_tm AND (SELECT end_date - interval '2' hour FROM gvars)
  GROUP BY 1
)

,pnl_calc as (
  SELECT 
    gt.account_user_id 
    ,profit_loss
    ,coalesce(bonus_amt,0) as bonus_amt
    ,profit_loss - coalesce(bonus_amt,0) as profit_loss_ex_bonus
    ,CASE WHEN (profit_loss * -1) - coalesce(bonus_amt,0) >= 1000 THEN 30 ELSE 0 END as pnl_free_spins
  FROM game_txn gt
  LEFT JOIN bonus_exclusion bc
  ON gt.account_user_id = bc.account_user_id 
)

SELECT 
  gt.account_user_id as "User ID"
  ,phone_number  as "Phone Number"
  ,turnover as "Total Turnover"
  ,game_count as "Game Rounds"
  ,gt.profit_loss as "Net Loss"
  ,bonus_amt as "Yesterday Bonus Amount"
  ,profit_loss_ex_bonus as "Profit Loss Minus Bonus"
  ,to_free_spins + gc_free_spins + pnl_free_spins as "Total Free Spins"
FROM game_txn gt
LEFT JOIN (SELECT user_id , is_phone_verified , phone_number FROM ads_mcd_bh_account) aa
ON account_user_id = user_id 
LEFT JOIN pnl_calc pc
ON gt.account_user_id = pc.account_user_id 
ORDER BY 8 DESC, 1